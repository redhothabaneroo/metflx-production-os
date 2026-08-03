import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listDashboardClients, getClientDetail } from "@/lib/data";
import {
  addBusinessDays,
  fmtDateShort,
  isTaskDone,
  isRecurring,
  TASK_DEFS,
  RETAINER_TASK_DEFS,
  REPEAT_TASK_DEFS,
  ONBOARDING_TASK_DEFS,
} from "@/lib/business";

export const dynamic = "force-dynamic";

// This route builds lean, purpose-specific objects field-by-field (task
// label/status/owner/dueDate as plain values) rather than spreading whole
// view-model objects from lib/data.ts, so there's nothing to strip here —
// unlike /api/knowledge, none of the UI color/styling fields are ever
// pulled in to begin with.

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// "today" / "tomorrow" / null — used for both shoot/discovery/approval
// dates and team task due dates.
function dayLabel(date: Date | null, today: Date, tomorrow: Date): "today" | "tomorrow" | null {
  if (!date) return null;
  const d = startOfDay(date);
  if (d.getTime() === today.getTime()) return "today";
  if (d.getTime() === tomorrow.getTime()) return "tomorrow";
  return null;
}

function taskStatus(tasks: { id: string; status: string }[], id: string) {
  return tasks.find((t) => t.id === id)?.status || "Not started";
}

// Mirrors the monthlyTaskDefs selection already used in getClientDetail —
// which fixed task-defs list a Task row's taskId resolves against depends
// on its scopeKey shape and, for monthly scopes, the client's type.
function resolveTaskLabel(clientType: string, scopeKey: string, taskId: string): string {
  let defs: { id: string; label: string }[];
  if (scopeKey === "onb") defs = ONBOARDING_TASK_DEFS;
  else if (scopeKey === "main") defs = TASK_DEFS;
  else if (/^m\d+$/.test(scopeKey)) defs = clientType === "REPEAT" ? REPEAT_TASK_DEFS : RETAINER_TASK_DEFS;
  else defs = [];
  return defs.find((d) => d.id === taskId)?.label || taskId;
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.KNOWLEDGE_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today.getTime() + 86400000);

    const [{ retainers, repeats, promos }, allClients, allVideos, shootDateRows, taskRows, customTaskRows] = await Promise.all([
      listDashboardClients(),
      prisma.client.findMany(),
      prisma.video.findMany(),
      prisma.shootDate.findMany(),
      prisma.task.findMany({ where: { status: { not: "Complete" } } }),
      prisma.customTask.findMany({ where: { status: { not: "Complete" } } }),
    ]);

    const allRows = [...retainers, ...repeats, ...promos];
    const clientMap = new Map(allClients.map((c) => [c.code, c]));
    const shootDateMap = new Map(shootDateRows.map((s) => [`${s.clientCode}:${s.scopeKey}`, s]));

    // Shoot date lookup shared by todayEvents and videoEditing — mirrors
    // the rawShootDateFor pattern already used in listKanbanBoard.
    const shootDateFor = (clientCode: string, month: number | null) => {
      const client = clientMap.get(clientCode);
      if (month == null) return shootDateMap.get(`${clientCode}:main`)?.date || client?.shootDate || null;
      return shootDateMap.get(`${clientCode}:m${month}`)?.date || null;
    };

    // 1. todayEvents
    const todayEvents: {
      client: string;
      type: string;
      event: "shoot" | "discovery" | "approval";
      date: string;
      when: "today" | "tomorrow";
    }[] = [];

    for (const row of allRows) {
      const client = clientMap.get(row.code);
      if (!client) continue;
      const recurring = isRecurring(client.type);
      const currentMonth = client.currentMonth || 1;

      const shootDate = recurring ? shootDateFor(row.code, currentMonth) : shootDateFor(row.code, null);
      const shootWhen = dayLabel(shootDate, today, tomorrow);
      if (shootWhen) todayEvents.push({ client: row.name, type: row.type, event: "shoot", date: fmtDateShort(shootDate), when: shootWhen });

      if (recurring) {
        const discoveryDate = shootDateMap.get(`${row.code}:m${currentMonth}-discovery`)?.date || null;
        const discoveryWhen = dayLabel(discoveryDate, today, tomorrow);
        if (discoveryWhen) todayEvents.push({ client: row.name, type: row.type, event: "discovery", date: fmtDateShort(discoveryDate), when: discoveryWhen });

        const approvalDate = shootDateMap.get(`${row.code}:m${currentMonth}-approval`)?.date || null;
        const approvalWhen = dayLabel(approvalDate, today, tomorrow);
        if (approvalWhen) todayEvents.push({ client: row.name, type: row.type, event: "approval", date: fmtDateShort(approvalDate), when: approvalWhen });
      }
    }

    // 2. promoClients, 3. retainerClients, 5. onboarding
    const promoClients: {
      name: string;
      owner: string;
      note: string;
      stage: string;
      tasks: { bookshoot: string; shoot: string; plan: string; bookapproval: string; approval: string };
    }[] = [];
    const retainerClients: {
      name: string;
      owner: string;
      note: string;
      currentMonth: number;
      totalMonths: number;
      stage: string;
      tasks: { bookshoot: string; shoot: string; editing: string; internalreview: string };
    }[] = [];
    // Retainer/repeat clients have no onboarding tracking today — the
    // checklist UI only ever renders for promo clients (see
    // getClientDetail's `onboarding.show: !isRetainer`), so this section
    // intentionally only ever contains promo clients. No placeholder
    // entries are fabricated for retainer/repeat clients.
    const onboarding: { client: string; owner: string; done: number; total: number; pendingSteps: string[] }[] = [];

    for (const row of allRows) {
      const detail = await getClientDetail(row.code);
      if (!detail) continue;

      if (detail.isPromo) {
        // "Fully delivered" means every video is at Final Delivery — see
        // the same check pattern already used for the promo stage
        // fallback in listDashboardClients.
        const fullyDelivered = row.total > 0 && row.dist.length === 1 && row.dist[0].stage === "Final Delivery";
        if (!fullyDelivered) {
          promoClients.push({
            name: row.name,
            owner: row.owner,
            note: row.note,
            stage: row.stage,
            tasks: {
              bookshoot: taskStatus(detail.tasks, "bookshoot"),
              shoot: taskStatus(detail.tasks, "shoot"),
              plan: taskStatus(detail.tasks, "plan"),
              bookapproval: taskStatus(detail.tasks, "bookapproval"),
              approval: taskStatus(detail.tasks, "approval"),
            },
          });
        }

        const pendingSteps = detail.onboarding.tasks.filter((t) => !isTaskDone(t.status)).map((t) => t.label);
        onboarding.push({ client: row.name, owner: row.owner, done: detail.onboarding.done, total: detail.onboarding.total, pendingSteps });
      } else {
        // No "inactive"/churned flag exists on Client — every retainer/
        // repeat client is included.
        const currentSection = detail.monthSections.find((m) => m.month === detail.currentMonth);
        const currentTasks = currentSection?.tasks || [];
        retainerClients.push({
          name: row.name,
          owner: row.owner,
          note: row.note,
          currentMonth: detail.currentMonth,
          totalMonths: detail.totalMonths,
          stage: row.stage,
          tasks: {
            bookshoot: taskStatus(currentTasks, "bookshoot"),
            shoot: taskStatus(currentTasks, "shoot"),
            editing: taskStatus(currentTasks, "editing"),
            internalreview: taskStatus(currentTasks, "internalreview"),
          },
        });
      }
    }

    // 4. videoEditing
    const videoEditing = allVideos
      .filter((v) => v.stage !== "Final Delivery")
      .map((v) => {
        const client = clientMap.get(v.clientCode);
        const shootDate = shootDateFor(v.clientCode, v.month);
        const due = addBusinessDays(shootDate, 10);
        return {
          client: client?.name || v.clientCode,
          videoCode: v.code,
          stage: v.stage,
          editor: client?.editor || null,
          dueDate: due ? fmtDateShort(due) : null,
          overdue: due ? startOfDay(due).getTime() < today.getTime() : false,
        };
      });

    // 6. teamTasks — every Task/CustomTask row across all team members,
    // not scoped to one person like getTeamBoard().
    const teamTasks: { task: string; assignee: string | null; status: string; dueDate: string | null; dueToday: boolean; client: string }[] = [];

    for (const t of taskRows) {
      const client = clientMap.get(t.clientCode);
      if (!client) continue;
      teamTasks.push({
        task: resolveTaskLabel(client.type, t.scopeKey, t.taskId),
        assignee: t.owner || null,
        status: t.status,
        dueDate: t.dueDate ? fmtDateShort(t.dueDate) : null,
        dueToday: dayLabel(t.dueDate, today, tomorrow) === "today",
        client: client.name,
      });
    }
    for (const t of customTaskRows) {
      const client = clientMap.get(t.clientCode);
      if (!client) continue;
      teamTasks.push({
        task: t.label,
        assignee: t.owner,
        status: t.status,
        dueDate: t.dueDate ? fmtDateShort(t.dueDate) : null,
        dueToday: dayLabel(t.dueDate, today, tomorrow) === "today",
        client: client.name,
      });
    }

    return NextResponse.json({
      todayEvents,
      promoClients,
      retainerClients,
      videoEditing,
      onboarding,
      teamTasks,
    });
  } catch (error) {
    console.error("GET /api/snapshot failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
