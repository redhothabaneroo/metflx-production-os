import { prisma } from "./db";
import {
  stageStyle,
  typeStyle,
  avatar,
  addBusinessDays,
  fmtDate,
  fmtDateShort,
  toDateInputValue,
  isTaskDone,
  isRecurring,
  isMonthTaskListComplete,
  clientTypeLabel,
  TASK_STATUS_STYLE,
  DELIV_STATUS,
  STAGES,
  PIPELINE_STAGES,
  TASK_DEFS,
  RETAINER_TASK_DEFS,
  REPEAT_TASK_DEFS,
  INVOICE_TASK_ID,
  ONBOARDING_TASK_DEFS,
  MILESTONE_LABELS,
  OWNER_EDITABLE_TASKS,
} from "./business";

const ORIGINAL_ORDER = ["LN", "IC", "GR", "OL", "MC", "PZ", "EC", "MI"];

// One-time self-heal for a past bug: creating a Retainer/Repeat client
// never tagged its initial video batch with a month, so those videos were
// invisible to any month-scoped query (dashboard stage, month sections).
// Safe to call on every request — a no-op once a client's videos are fixed.
async function repairOrphanedMonthlyVideos() {
  const orphaned = await prisma.video.findMany({
    where: { month: null, client: { type: { in: ["RETAINER", "REPEAT"] } } },
    orderBy: { id: "asc" },
  });
  if (!orphaned.length) return;
  const byClient = new Map<string, typeof orphaned>();
  for (const v of orphaned) {
    const list = byClient.get(v.clientCode) || [];
    list.push(v);
    byClient.set(v.clientCode, list);
  }
  for (const videos of byClient.values()) {
    for (let i = 0; i < videos.length; i++) {
      await prisma.video.update({ where: { id: videos[i].id }, data: { month: 1, num: i + 1 } });
    }
  }
}

// One-time self-heal for a past bug: nothing ever advanced currentMonth
// automatically, so a client whose month was already fully complete
// before that logic existed stays stuck showing the finished month
// forever. Safe to call on every request — a no-op once caught up.
async function repairStuckMonths() {
  const clients = await prisma.client.findMany({ where: { type: { in: ["RETAINER", "REPEAT"] } } });
  for (const c of clients) {
    let month = c.currentMonth || 1;
    const total = c.totalMonths || 6;
    const defs = c.type === "REPEAT" ? REPEAT_TASK_DEFS : RETAINER_TASK_DEFS;
    let advanced = false;
    while (month < total) {
      const tasks = await prisma.task.findMany({ where: { clientCode: c.code, scopeKey: `m${month}` } });
      const statusMap = new Map(tasks.map((t) => [t.taskId, t.status]));
      if (!isMonthTaskListComplete(defs, statusMap)) break;
      month++;
      advanced = true;
    }
    if (advanced) {
      await prisma.client.update({ where: { code: c.code }, data: { currentMonth: month } });
    }
  }
}

export async function getCompanyOrder(): Promise<string[]> {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "asc" }, select: { code: true } });
  const codes = clients.map((c) => c.code);
  const added = codes.filter((c) => !ORIGINAL_ORDER.includes(c)).reverse();
  const original = ORIGINAL_ORDER.filter((c) => codes.includes(c));
  return [...added, ...original];
}

function shortLabel(stage: string) {
  const m: Record<string, string> = {
    "On Queue": "Queue",
    "Raw Upload": "Raw",
    Packaging: "Pkg",
    Editing: "Editing",
    "Internal Review": "Internal",
    Revision: "Revision",
    "Client Review": "Client",
    "Final Delivery": "Final",
  };
  return m[stage] || stage;
}

export async function listDashboardClients() {
  await repairOrphanedMonthlyVideos();
  await repairStuckMonths();
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "asc" } });
  const allVideos = await prisma.video.findMany();

  const rows = clients.map((c) => {
    const t = typeStyle(clientTypeLabel(c.type));
    const isRetainerRow = isRecurring(c.type);
    const cvs = isRetainerRow
      ? allVideos.filter((v) => v.clientCode === c.code && v.month === (c.currentMonth || 1))
      : allVideos.filter((v) => v.clientCode === c.code && v.month === null);
    const dist = PIPELINE_STAGES.map((st) => ({
      stage: st,
      short: shortLabel(st),
      count: cvs.filter((v) => v.stage === st).length,
      color: stageStyle(st).fg,
    })).filter((d) => d.count > 0);

    const isRetainer = isRecurring(c.type);
    const cur = c.currentMonth || 1;
    const total = c.totalMonths || 6;
    let stageLabel: string;
    let stageTone: { bg: string; fg: string };
    const bottleneckStage = (list: typeof cvs) => {
      const idx = Math.min(...list.map((v) => PIPELINE_STAGES.indexOf(v.stage as (typeof PIPELINE_STAGES)[number])));
      return PIPELINE_STAGES[idx];
    };
    if (isRetainer) {
      if (!cvs.length) {
        stageLabel = "Not started";
        stageTone = { bg: "#eef0f3", fg: "#5b6470" };
      } else {
        stageLabel = bottleneckStage(cvs);
        stageTone = stageStyle(stageLabel);
      }
    } else {
      // "On Queue" is just the default a video is created with, before the
      // shoot even happens — it isn't real progress, so a promo client still
      // in pre-production keeps showing its actual business-stage field.
      const producedVideos = cvs.filter((v) => v.stage !== "On Queue");
      if (!producedVideos.length) {
        stageLabel = c.stage;
        stageTone = toneForStage(c.stage);
      } else {
        stageLabel = bottleneckStage(producedVideos);
        stageTone = stageStyle(stageLabel);
      }
    }
    const next = isRetainer
      ? `Deliver month ${cur} videos`
      : c.note
        ? c.note.includes("Booking the shoot")
          ? "Book the shoot"
          : "Pass to client review"
        : "—";
    const note = isRetainer
      ? `Month ${cur} of ${total} — months 1${cur > 2 ? "–" + (cur - 1) : ""} delivered, month ${cur} in production.`
      : c.note || "";

    return {
      code: c.code,
      name: c.name,
      type: clientTypeLabel(c.type),
      typeBg: t.bg,
      typeFg: t.fg,
      stage: stageLabel,
      stageBg: stageTone.bg,
      stageFg: stageTone.fg,
      month: isRetainer ? ([cur, total] as [number, number]) : null,
      monthLabel: isRetainer ? `${cur} / ${total}` : "",
      monthPct: isRetainer ? `${Math.round((cur / total) * 100)}%` : "0%",
      dist,
      total: cvs.length,
      hasEdits: cvs.length > 0,
      noEdits: cvs.length === 0,
      next: isRetainer ? next : c.note?.includes("Booking") ? "Book the shoot" : "Pass to client review",
      nextDate: isRetainer ? "In progress" : "TBD",
      status: "on" as const,
      statusLabel: "On track",
      statusBg: "#e9f6ee",
      statusFg: "#15803d",
      statusDot: "#16a34a",
      note,
      owner: c.owner,
    };
  });

  const retainers = rows.filter((r) => r.type === "Retainer");
  const repeats = rows.filter((r) => r.type === "Repeat");
  const promos = rows.filter((r) => r.type === "Promo");
  return { retainers, repeats, promos };
}

function toneForStage(stage: string) {
  const tone: Record<string, { bg: string; fg: string }> = {
    "Content plan approved": { bg: "#eef0f3", fg: "#5b6470" },
    "Internal review": { bg: "#f1ecfd", fg: "#7c3aed" },
  };
  return tone[stage] || { bg: "#eef0f3", fg: "#5b6470" };
}

export async function listClientOptions() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "asc" } });
  return clients.map((c) => ({
    code: c.code,
    name: c.name,
    type: clientTypeLabel(c.type),
    label: `${c.name} — ${clientTypeLabel(c.type)}`,
    currentMonth: c.currentMonth || 1,
  }));
}

export async function listKanbanBoard() {
  const companyOrder = await getCompanyOrder();
  const clients = await prisma.client.findMany();
  const clientMap = new Map(clients.map((c) => [c.code, c]));
  const allVideos = await prisma.video.findMany({ orderBy: { id: "asc" } });
  const boardVideos = allVideos.filter((v) => v.month === null || v.stage !== "Final Delivery");
  const shootDates = await prisma.shootDate.findMany();
  const shootDateMap = new Map(shootDates.map((s) => [`${s.clientCode}:${s.scopeKey}`, s.date]));

  const rawShootDateFor = (clientCode: string, month: number | null) => {
    const client = clientMap.get(clientCode);
    return month == null ? shootDateMap.get(`${clientCode}:main`) || client?.shootDate || null : shootDateMap.get(`${clientCode}:m${month}`) || null;
  };
  const shootDateFor = (clientCode: string, month: number | null) => {
    const d = rawShootDateFor(clientCode, month);
    return d ? fmtDateShort(d) : null;
  };
  const dueDateFor = (clientCode: string, month: number | null) => {
    const due = addBusinessDays(rawShootDateFor(clientCode, month), 10);
    return due ? fmtDateShort(due) : null;
  };

  const columns = PIPELINE_STAGES.map((stage) => {
    const sc = stageStyle(stage);
    const inStage = boardVideos.filter((v) => v.stage === stage);
    const buckets = companyOrder
      .filter((code) => inStage.some((v) => v.clientCode === code))
      .map((code) => {
        const cvs = inStage.filter((v) => v.clientCode === code);
        const client = clientMap.get(code)!;
        const t = typeStyle(clientTypeLabel(client.type));
        const months = new Set(cvs.map((v) => v.month).filter((m) => m != null));
        const singleMonth = months.size === 1 ? [...months][0] : null;
        const bucketDueDates = new Set(cvs.map((v) => dueDateFor(code, v.month)).filter((d) => d != null));
        const bucketDueDate = bucketDueDates.size === 1 ? [...bucketDueDates][0] : null;
        const bucketShootDates = new Set(cvs.map((v) => shootDateFor(code, v.month)).filter((d) => d != null));
        const bucketShootDate = bucketShootDates.size === 1 ? [...bucketShootDates][0] : null;
        return {
          code,
          name: client.name,
          type: clientTypeLabel(client.type),
          typeBg: t.bg,
          typeFg: t.fg,
          dot: t.fg,
          count: cvs.length,
          monthShow: singleMonth != null,
          month: singleMonth,
          dueDate: bucketDueDate,
          shootDate: bucketShootDate,
          videos: cvs.map((v) => ({
            id: v.id,
            clientCode: code,
            code: v.code,
            title: v.title || "Deliverable",
            month: v.month,
            monthShow: v.month != null,
            ir: v.ir,
            cr: v.cr,
            irShow: v.ir > 0,
            crShow: v.cr > 0,
            accent: t.fg,
            dueDate: dueDateFor(code, v.month),
            shootDate: shootDateFor(code, v.month),
          })),
        };
      });
    return { stage, name: stage, fg: sc.fg, count: inStage.length, buckets };
  });

  return columns;
}

export async function listLifecycleLanes() {
  const LANES = [
    "Onboarding",
    "Discovery & Plan",
    "Plan Approval",
    "Shoot Scheduled",
    "In Post",
    "Client Review",
    "Delivered / Live",
  ];
  const laneKeyMap: Record<string, string> = {
    "Delivered / Live": "Delivered/Live",
  };
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "asc" } });
  return LANES.map((label) => {
    const key = laneKeyMap[label] || label;
    const items = clients
      .filter((c) => c.lane === key)
      .map((c) => {
        const t = typeStyle(clientTypeLabel(c.type));
        const ow = avatar(c.owner);
        return {
          code: c.code,
          client: c.name,
          type: clientTypeLabel(c.type),
          typeFg: t.fg,
          note: c.note || (c.lane === "Onboarding" ? "New client — onboarding just started" : ""),
          owner: c.owner,
          ownerBg: ow.bg,
          ownerFg: ow.fg,
          ownerInit: ow.initials,
          next: c.lane === "Onboarding" ? "Kick off" : c.lane === "Plan Approval" ? "Book shoot" : "—",
        };
      });
    return { name: label, count: items.length, items };
  });
}

export async function listSchedule() {
  const clients = await prisma.client.findMany();
  const shootDates = await prisma.shootDate.findMany();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const days = dayNames.map((dow, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    return { dow, dnum: String(d.getDate()), date: d, isToday, events: [] as Array<{ title: string; sub: string; kind: string }> };
  });

  const addEvent = (date: Date | null, title: string, sub: string, kind: string) => {
    if (!date) return;
    const day = days.find((d) => d.date.toDateString() === date.toDateString());
    if (day) day.events.push({ title, sub, kind });
  };

  const shootTasks = await prisma.task.findMany({ where: { taskId: "shoot" } });
  const shootOwnerMap = new Map(shootTasks.map((t) => [`${t.clientCode}:${t.scopeKey}`, t.owner]));
  const crewCounts: Record<string, number> = {};
  const tallyCrew = (clientCode: string, scopeKey: string) => {
    const owner = shootOwnerMap.get(`${clientCode}:${scopeKey}`) || "Brody";
    crewCounts[owner] = (crewCounts[owner] || 0) + 1;
  };

  for (const c of clients) {
    if (c.shootDate) {
      addEvent(c.shootDate, c.name, "Shoot", "shoot");
      if (c.shootDate >= monday && c.shootDate <= new Date(monday.getTime() + 6 * 86400000)) tallyCrew(c.code, "main");
    }
  }
  for (const sd of shootDates) {
    const client = clients.find((c) => c.code === sd.clientCode);
    if (!client) continue;
    const monthMatch = sd.scopeKey.match(/^m(\d+)$/);
    const label = monthMatch ? `Month ${monthMatch[1]} shoot` : "Shoot";
    addEvent(sd.date, client.name, label, "shoot");
    if (sd.date >= monday && sd.date <= new Date(monday.getTime() + 6 * 86400000)) tallyCrew(client.code, sd.scopeKey);
    const due = addBusinessDays(sd.date, 10);
    addEvent(due, client.name, "Deliverables due", "deadline");
  }

  const KIND_STYLE: Record<string, { bg: string; accent: string; fg: string }> = {
    shoot: { bg: "#eef1fd", accent: "#3754db", fg: "#23306e" },
    meeting: { bg: "#f4eefc", accent: "#7c3aed", fg: "#5b2aa0" },
    deadline: { bg: "#fdf3e7", accent: "#d97706", fg: "#8a4d09" },
  };

  const week = days.map((d) => ({
    dow: d.dow,
    dnum: d.dnum,
    today: d.isToday,
    colBg: d.isToday ? "#fbfcff" : "#fff",
    numColor: d.isToday ? "#3754db" : "#1a1d21",
    events: d.events.map((e) => ({ ...e, ...KIND_STYLE[e.kind] })),
  }));

  const needsBooking = clients
    .filter((c) => !c.shootDate && c.lane === "Onboarding" && isRecurring(c.type))
    .map((c) => ({
      client: c.name,
      kind: "Discovery",
      kbg: "#eef1fd",
      kfg: "#3754db",
      note: `New ${clientTypeLabel(c.type).toLowerCase()} client — book discovery call`,
      cta: "Book discovery",
    }));
  if (clients.some((c) => c.code === "EC" && !c.shootDate)) {
    needsBooking.push({
      client: "Extra Cloud",
      kind: "Shoot",
      kbg: "#fdf3e7",
      kfg: "#b45309",
      note: "Content plan approved — book the shoot",
      cta: "Book shoot",
    });
  }

  const crewLoad = Object.entries(crewCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => {
      const av = avatar(name);
      return { name, count, initials: av.initials, bg: av.bg, fg: av.fg };
    });

  return { week, needsBooking, crewLoad, weekLabel: `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(monday.getTime() + 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` };
}

export async function listUpcoming() {
  const clients = await prisma.client.findMany();
  const shootDates = await prisma.shootDate.findMany();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  type Item = { code: string; name: string; date: Date; title: string; sub: string; kind: "shoot" | "deadline" };
  const items: Item[] = [];

  for (const c of clients) {
    if (c.shootDate && c.shootDate >= today) {
      items.push({ code: c.code, name: c.name, date: c.shootDate, title: c.name, sub: "Shoot day", kind: "shoot" });
    }
  }
  for (const sd of shootDates) {
    const client = clients.find((c) => c.code === sd.clientCode);
    if (!client) continue;
    const monthMatch = sd.scopeKey.match(/^m(\d+)$/);
    const label = monthMatch ? `Month ${monthMatch[1]} shoot` : "Shoot day";
    if (sd.date >= today) items.push({ code: client.code, name: client.name, date: sd.date, title: client.name, sub: label, kind: "shoot" });
    const due = addBusinessDays(sd.date, 10);
    if (due && due >= today) items.push({ code: client.code, name: client.name, date: due, title: client.name, sub: "Deliverables due", kind: "deadline" });
  }

  items.sort((a, b) => a.date.getTime() - b.date.getTime());

  const STYLE: Record<string, { bg: string; accent: string }> = {
    shoot: { bg: "#eef1fd", accent: "#3754db" },
    meeting: { bg: "#f4eefc", accent: "#7c3aed" },
    deadline: { bg: "#fdf3e7", accent: "#d97706" },
  };
  const MON_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  return items.slice(0, 8).map((u) => ({
    code: u.code,
    month: MON_NAMES[u.date.getMonth()],
    dnum: String(u.date.getDate()),
    title: u.title,
    sub: u.sub,
    kindLabel: u.kind === "shoot" ? "Shoot" : "Deadline",
    bg: STYLE[u.kind].bg,
    accent: STYLE[u.kind].accent,
  }));
}

export async function listActiveEditsCount() {
  const videos = await prisma.video.findMany({
    where: { stage: { not: "On Queue" } },
    include: { client: { select: { type: true, currentMonth: true } } },
  });
  return videos.filter((v) => (isRecurring(v.client.type) ? v.month === (v.client.currentMonth || 1) : v.month === null)).length;
}

export async function listShootsThisWeekCount() {
  const { week } = await listSchedule();
  return week.reduce((a, d) => a + d.events.filter((e) => e.kind === "shoot").length, 0);
}

const CONTRACTS_FALLBACK: Record<string, { plan: string }> = {};

export async function getClientDetail(code: string) {
  await repairOrphanedMonthlyVideos();
  await repairStuckMonths();
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "asc" } });
  const client = clients.find((c) => c.code === code) || clients[0];
  if (!client) return null;

  const menu = [
    { label: "Retainers", dot: "#0f766e", clients: clients.filter((c) => c.type === "RETAINER") },
    { label: "Repeat clients", dot: "#c2410c", clients: clients.filter((c) => c.type === "REPEAT") },
    { label: "Promo", dot: "#3754db", clients: clients.filter((c) => c.type === "PROMO") },
  ].map((g) => ({
    label: g.label,
    dot: g.dot,
    count: g.clients.length,
    clients: g.clients.map((c) => {
      const t = typeStyle(clientTypeLabel(c.type));
      return {
        code: c.code,
        name: c.name,
        active: c.code === client.code,
        badgeBg: t.bg,
        badgeFg: t.fg,
      };
    }),
  }));

  const isRetainer = isRecurring(client.type);
  const queueVideos = await prisma.video.findMany({ where: { clientCode: code, month: null }, orderBy: { id: "asc" } });
  const tasks = await prisma.task.findMany({ where: { clientCode: code } });
  const shootDates = await prisma.shootDate.findMany({ where: { clientCode: code } });

  const taskStatusMap = new Map(tasks.map((t) => [`${t.scopeKey}:${t.taskId}`, t]));
  const shootDateMap = new Map(shootDates.map((s) => [s.scopeKey, s.date]));

  const vOrder: string[] = [...PIPELINE_STAGES];
  const stageIdxMap: Record<string, number> = { Onboarding: -1, "Raw upload": 0, Packaging: 1, Editing: 2, "Internal review": 3, "Client review": 4, "Final delivery": 5 };
  let liveIdx = stageIdxMap[client.stage] ?? -1;
  if (queueVideos.length) {
    liveIdx = Math.min(...queueVideos.map((v) => vOrder.indexOf(v.stage)));
  }

  const stepper = STAGES.map((name, i) => {
    const isDone = i < liveIdx, isCurrent = i === liveIdx;
    return {
      name,
      isDone,
      isCurrent,
      dotBg: isDone ? "#16a34a" : isCurrent ? "#3754db" : "#fff",
      dotBorder: isDone ? "#16a34a" : isCurrent ? "#3754db" : "#cdd2d8",
      vlineBg: i < liveIdx ? "#16a34a" : "#e3e6ea",
      labelFg: isDone || isCurrent ? "#1a1d21" : "#9aa1aa",
      labelWeight: isCurrent ? "600" : "500",
    };
  });

  const isTaskStatusDone = isTaskDone;

  const buildTaskList = (defs: typeof TASK_DEFS, scopeKey: string, curForDefault: number) =>
    defs.map((t) => {
      const def = t.m < curForDefault ? "Complete" : t.m === curForDefault ? "In progress" : "Not started";
      const row = taskStatusMap.get(`${scopeKey}:${t.id}`);
      const status = row?.status || def;
      const s = TASK_STATUS_STYLE[status];
      const ownerEditable = OWNER_EDITABLE_TASKS.includes(t.id);
      const owner = ownerEditable ? row?.owner || t.owner : t.owner;
      const ow = avatar(owner);
      return {
        id: t.id,
        label: t.label,
        owner,
        ownerBg: ow.bg,
        ownerFg: ow.fg,
        ownerInit: ow.initials,
        m: t.m,
        ownerEditable,
        status,
        statusBg: s.bg,
        statusFg: s.fg,
        statusDot: s.dot,
        statusBorder: s.border,
        scopeKey,
        dueDate: toDateInputValue(row?.dueDate || null),
      };
    });

  const shootDateMain = shootDateMap.get("main") || client.shootDate || null;
  const dueMain = addBusinessDays(shootDateMain, 10);

  const onboarding = ONBOARDING_TASK_DEFS.map((t) => {
    const pastOnboarding = client.stage !== "Onboarding";
    const seed: Record<string, string> = { invoice: "Complete", onbemail: "Complete", slackinvite: "Complete", payment: "Pending", sla: "Not started", joined: "Not started", discbook: "Not started", disccomplete: "Not started" };
    const def = pastOnboarding ? "Complete" : seed[t.id] || "Not started";
    const row = taskStatusMap.get(`onb:${t.id}`);
    const status = row?.status || def;
    const s = TASK_STATUS_STYLE[status];
    const ow = avatar(t.owner);
    return { id: t.id, label: t.label, owner: t.owner, ownerBg: ow.bg, ownerFg: ow.fg, ownerInit: ow.initials, status, statusBg: s.bg, statusFg: s.fg, statusDot: s.dot, statusBorder: s.border, dueDate: toDateInputValue(row?.dueDate || null) };
  });
  const onbDone = onboarding.filter((t) => isTaskStatusDone(t.status)).length;

  let mainTasks: ReturnType<typeof buildTaskList> = [];
  let cur = 0;
  const producedVideos = queueVideos.filter((v) => v.stage !== "On Queue");
  const monthlyTaskDefs = client.type === "REPEAT" ? REPEAT_TASK_DEFS : RETAINER_TASK_DEFS;

  if (!isRetainer) {
    const milestoneIdx: Record<string, number> = { "Shoot complete": 5, "Raw files uploaded": 6, "Raw files packaged": 7, Editing: 8, "Internal review": 9, "Client review": 12, "Final delivery": 13 };
    const stageToMilestone = ["Shoot complete", "Raw files uploaded", "Raw files packaged", "Editing", "Internal review", "Internal review", "Client review", "Final delivery"];
    let curFromStage = ({ Onboarding: 0, "Raw upload": 6, Packaging: 7, Editing: 8, "Internal review": 9, "Client review": 12, "Final delivery": 13 } as Record<string, number>)[client.stage] ?? 0;
    if (producedVideos.length) curFromStage = milestoneIdx[stageToMilestone[liveIdx]] ?? curFromStage;
    mainTasks = buildTaskList(TASK_DEFS, "main", curFromStage);

    // A task marked complete by hand should be able to advance the timeline
    // even if the matching video card hasn't been dragged to that stage yet.
    let taskDerivedCur = onbDone === onboarding.length ? 1 : -1;
    mainTasks.forEach((t) => {
      if (isTaskStatusDone(t.status)) taskDerivedCur = Math.max(taskDerivedCur, t.m);
    });
    const curFromTasks = taskDerivedCur >= 0 ? Math.min(taskDerivedCur + 1, 13) : 0;
    cur = Math.max(curFromStage, curFromTasks);
  } else {
    const currentMonthTasks = buildTaskList(monthlyTaskDefs, `m${client.currentMonth || 1}`, 0);
    let taskDerivedCur = -1;
    currentMonthTasks.forEach((t) => {
      if (t.id === INVOICE_TASK_ID) return;
      if (isTaskStatusDone(t.status)) taskDerivedCur = Math.max(taskDerivedCur, t.m);
    });
    const curFromTasks = taskDerivedCur >= 0 ? Math.min(taskDerivedCur + 1, 13) : 0;

    // A video dragged ahead on the Kanban board should be able to advance
    // the timeline too, even if the task checklist hasn't been ticked yet.
    const curMonthVideos = await prisma.video.findMany({ where: { clientCode: code, month: client.currentMonth || 1 } });
    const stageMilestone: Record<string, number> = { Editing: 8, "Internal Review": 9, Revision: 9, "Final Delivery": 13 };
    const bottleneckStage = curMonthVideos.length ? vOrder[Math.min(...curMonthVideos.map((v) => vOrder.indexOf(v.stage)))] : null;
    const curFromStage = bottleneckStage ? stageMilestone[bottleneckStage] ?? 0 : 0;

    cur = Math.max(curFromTasks, curFromStage);
  }

  const timeline = MILESTONE_LABELS.map((label, i) => {
    const done = i < cur, current = i === cur;
    return {
      label,
      dotBg: done ? "#16a34a" : current ? "#3754db" : "#fff",
      dotBorder: done ? "#16a34a" : current ? "#3754db" : "#cdd2d8",
      leftLineBg: i === 0 ? "transparent" : done || current ? "#16a34a" : "#e3e6ea",
      fg: i > cur ? "#9aa1aa" : "#1a1d21",
      weight: current ? "600" : "500",
    };
  }).filter((_, i) => !(isRetainer && i === 0));
  const nextMilestoneIdx = isRetainer ? Math.max(cur, 1) : cur;
  const nextMilestone = nextMilestoneIdx < MILESTONE_LABELS.length ? MILESTONE_LABELS[nextMilestoneIdx] : "Complete";

  const delivStatusFor = (stage: string) => DELIV_STATUS[stage] || DELIV_STATUS["On Queue"];
  const deliverables = queueVideos.map((v, i) => {
    const s = delivStatusFor(v.stage);
    return { n: String(i + 1).padStart(2, "0"), code: v.code, title: v.title, status: s.label, statusBg: s.bg, statusFg: s.fg, dueDate: dueMain ? fmtDateShort(dueMain) : "—" };
  });

  const buildMonthSections = async () => {
    const curMo = client.currentMonth || 1;
    const totalMo = client.totalMonths || 6;
    const allRetainerVideos = await prisma.video.findMany({ where: { clientCode: code, month: { not: null } }, orderBy: [{ month: "asc" }, { num: "asc" }] });
    return Array.from({ length: totalMo }, (_, i) => i + 1).map((mo) => {
      const scopeKey = `m${mo}`;
      const moShootDate = shootDateMap.get(scopeKey) || null;
      const moDue = addBusinessDays(moShootDate, 10);
      const moCurForDefault = mo < curMo ? 99 : 0;
      const moTasks = buildTaskList(monthlyTaskDefs, scopeKey, moCurForDefault);
      const moDone = moTasks.filter((t) => isTaskStatusDone(t.status)).length;
      const isComplete = moTasks.length > 0 && moDone === moTasks.length;
      const moDeliverables = allRetainerVideos
        .filter((v) => v.month === mo)
        .map((v) => {
          const s = delivStatusFor(v.stage);
          return { code: v.code, stage: v.stage, status: s.label, statusBg: s.bg, statusFg: s.fg, dueDate: moDue ? fmtDateShort(moDue) : "—" };
        });
      const cs = client.contractStart;
      const monthDate = cs ? new Date(cs.getFullYear(), cs.getMonth() + (mo - 1), 1) : null;
      const monthName = monthDate ? monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";
      return {
        month: mo,
        label: `Month ${mo}${monthName ? " · " + monthName : ""}`,
        isComplete,
        defaultOpen: mo === curMo,
        shootDate: toDateInputValue(moShootDate),
        tasks: moTasks,
        tasksDone: moDone,
        tasksTotal: moTasks.length,
        deliverables: moDeliverables,
        hasDeliverables: moDeliverables.length > 0,
        delivDone: moDeliverables.filter((v) => v.stage === "Final Delivery").length,
        delivTotal: moDeliverables.length,
      };
    });
  };
  const monthSections = isRetainer ? await buildMonthSections() : [];

  const fileDefs = [
    { tag: "RAW", bg: "#eef0f3", fg: "#6b7280", name: `${code}_RAW`, link: client.rawFolderLink },
    { tag: "FIO", bg: "#eef1fd", fg: "#3754db", name: "Frame.io review link", link: client.frameIoLink },
    { tag: "DRV", bg: "#e9f6ee", fg: "#15803d", name: "Final delivery (Drive)", link: client.finalDeliveryLink },
  ];
  const files = fileDefs.map((fd) => ({ ...fd, showLink: !!fd.link }));

  const metaLine = isRetainer
    ? `Month ${client.currentMonth || 1} of ${client.totalMonths} · ${queueVideos.length + monthSections.reduce((a, m) => a + m.deliverables.length, 0)} deliverables`
    : `Promo · ${queueVideos.length} deliverables`;

  return {
    code: client.code,
    name: client.name,
    type: clientTypeLabel(client.type),
    typeBg: typeStyle(clientTypeLabel(client.type)).bg,
    typeFg: typeStyle(clientTypeLabel(client.type)).fg,
    metaLine,
    account: client.owner,
    editor: client.editor || "—",
    isRetainer,
    isPromo: !isRetainer,
    menu,
    stepper,
    timeline,
    nextMilestone,
    note: client.note || "",
    info: {
      contact: client.contact || "—",
      email: client.email || "—",
      plan: client.plan || "—",
      start: fmtDate(client.contractStart),
      end: isRetainer ? fmtDate(client.contractEnd) : "One-time delivery",
      endLabel: isRetainer ? "Contract ends" : "Delivery",
      isRetainer,
    },
    onboarding: { show: !isRetainer, tasks: onboarding, done: onbDone, total: onboarding.length, allComplete: onbDone === onboarding.length },
    tasks: mainTasks,
    deliverables,
    hasDeliverables: deliverables.length > 0,
    irTotal: queueVideos.reduce((a, v) => a + v.ir, 0),
    crTotal: queueVideos.reduce((a, v) => a + v.cr, 0),
    shootDate: toDateInputValue(shootDateMain),
    monthSections,
    files,
    currentMonth: client.currentMonth || 1,
    totalMonths: client.totalMonths,
  };
}

const ONB_STATUS_OPTIONS = ["Not started", "In progress", "Complete", "Not applicable", "Pending"];
const PROMO_STATUS_OPTIONS = ["Not started", "In progress", "Complete", "Pending"];
const RETAINER_STATUS_OPTIONS = ["Not started", "In progress", "Complete", "Not applicable", "Pending"];

export async function getTeamBoard(member: string) {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "asc" } });
  const av = avatar(member);

  type BoardTask = {
    id: string;
    label: string;
    owner: string;
    ownerBg: string;
    ownerFg: string;
    ownerInit: string;
    status: string;
    statusBg: string;
    statusFg: string;
    statusDot: string;
    statusBorder: string;
    ownerEditable?: boolean;
    scopeKey: string;
    statusOptions: string[];
    dueDate: string | null;
    dueDateRaw?: string | null;
    custom?: boolean;
    customId?: number;
  };
  type ClientGroup = {
    clientCode: string;
    clientName: string;
    clientType: string;
    typeBg: string;
    typeFg: string;
    tasks: BoardTask[];
  };

  const customTasks = await prisma.customTask.findMany({ where: { owner: member }, orderBy: { createdAt: "asc" } });
  const customTasksByClient = new Map<string, typeof customTasks>();
  for (const ct of customTasks) {
    const list = customTasksByClient.get(ct.clientCode) || [];
    list.push(ct);
    customTasksByClient.set(ct.clientCode, list);
  }

  const groups: ClientGroup[] = [];

  for (const c of clients) {
    const detail = await getClientDetail(c.code);
    if (!detail) continue;

    const tasks: BoardTask[] = [];
    const pushTask = (
      t: { id: string; label: string; owner: string; status: string; statusBg: string; statusFg: string; statusDot: string; statusBorder: string; ownerEditable?: boolean; dueDate: string },
      scopeKey: string,
      statusOptions: string[]
    ) => {
      if (t.owner !== member) return;
      tasks.push({
        id: t.id,
        label: t.label,
        owner: t.owner,
        ownerBg: av.bg,
        ownerFg: av.fg,
        ownerInit: av.initials,
        status: t.status,
        statusBg: t.statusBg,
        statusFg: t.statusFg,
        statusDot: t.statusDot,
        statusBorder: t.statusBorder,
        ownerEditable: t.ownerEditable,
        scopeKey,
        statusOptions,
        dueDate: t.dueDate ? fmtDateShort(new Date(t.dueDate + "T00:00:00")) : null,
        dueDateRaw: t.dueDate || null,
      });
    };

    if (detail.isPromo) {
      detail.onboarding.tasks.forEach((t) => pushTask(t, "onb", ONB_STATUS_OPTIONS));
      detail.tasks.forEach((t) => pushTask(t, t.scopeKey, PROMO_STATUS_OPTIONS));
    } else {
      const currentSection = detail.monthSections.find((m) => m.month === detail.currentMonth);
      currentSection?.tasks.forEach((t) => pushTask(t, t.scopeKey, RETAINER_STATUS_OPTIONS));
    }

    for (const ct of customTasksByClient.get(c.code) || []) {
      const s = TASK_STATUS_STYLE[ct.status] || TASK_STATUS_STYLE["Not started"];
      tasks.push({
        id: `custom-${ct.id}`,
        label: ct.label,
        owner: ct.owner,
        ownerBg: av.bg,
        ownerFg: av.fg,
        ownerInit: av.initials,
        status: ct.status,
        statusBg: s.bg,
        statusFg: s.fg,
        statusDot: s.dot,
        statusBorder: s.border,
        scopeKey: "custom",
        statusOptions: RETAINER_STATUS_OPTIONS,
        dueDate: ct.dueDate ? fmtDateShort(ct.dueDate) : null,
        dueDateRaw: ct.dueDate ? toDateInputValue(ct.dueDate) : null,
        custom: true,
        customId: ct.id,
      });
    }

    if (tasks.length) {
      groups.push({ clientCode: detail.code, clientName: detail.name, clientType: detail.type, typeBg: detail.typeBg, typeFg: detail.typeFg, tasks });
    }
  }

  return groups;
}
