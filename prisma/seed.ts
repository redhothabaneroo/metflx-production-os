import { PrismaClient, ClientType } from "@prisma/client";
import { VIDEO_TITLES, ONBOARDING_TASK_DEFS } from "../lib/business";

const prisma = new PrismaClient();

const CURRENT_MONTH_OF: Record<string, number> = { LN: 3, IC: 5, GR: 2, OL: 3, MC: 3, PZ: 2 };
const TOTAL_MONTHS_OF: Record<string, number> = { OL: 3 };
const CONTRACT_START: Record<string, { y: number; m: number }> = {
  LN: { y: 2026, m: 5 },
  IC: { y: 2026, m: 2 },
  GR: { y: 2026, m: 5 },
  OL: { y: 2026, m: 5 },
  MC: { y: 2026, m: 3 },
  PZ: { y: 2026, m: 5 },
};

const CLIENTS: Array<{
  code: string;
  name: string;
  type: ClientType;
  owner: string;
  editor?: string;
  stage: string;
  lane: string;
  note?: string;
  contact?: string;
  email?: string;
  plan?: string;
  contractStart?: Date;
  contractEnd?: Date | null;
  currentMonth?: number;
  shootDate?: Date;
}> = [
  { code: "LN", name: "Little Naples", type: "RETAINER", owner: "Priya", stage: "In production", lane: "Onboarding" },
  { code: "IC", name: "ICAA Law", type: "RETAINER", owner: "Priya", stage: "In production", lane: "Onboarding" },
  { code: "GR", name: "Grinta", type: "RETAINER", owner: "Priya", stage: "In production", lane: "Onboarding" },
  { code: "OL", name: "Othman Lawyers", type: "RETAINER", owner: "Priya", stage: "In production", lane: "Onboarding" },
  { code: "MC", name: "Mimi & Co", type: "RETAINER", owner: "Priya", stage: "In production", lane: "Onboarding" },
  { code: "PZ", name: "Promaz", type: "RETAINER", owner: "Priya", stage: "In production", lane: "Onboarding" },
  {
    code: "EC",
    name: "Extra Cloud",
    type: "PROMO",
    owner: "Brody",
    editor: "Utkarsh",
    stage: "Content plan approved",
    lane: "Plan Approval",
    note: "Onboarding complete, content plan approved. Booking the shoot next.",
    contact: "Mark Sarsam",
    email: "mark@extracloud.com.au",
    plan: "—",
    contractStart: new Date(2026, 2, 31),
    contractEnd: null,
  },
  {
    code: "MI",
    name: "Modern Innovations",
    type: "PROMO",
    owner: "Jules",
    editor: "Jules",
    stage: "Internal review",
    lane: "In Post",
    note: "Editing complete on all 10 videos. Now in internal review.",
    contact: "Dan Wijeratne",
    email: "dr.dgcwije@gmail.com",
    plan: "10-video promo package",
    contractStart: new Date(2026, 3, 27),
    contractEnd: null,
    shootDate: new Date(2026, 5, 23),
  },
];

async function main() {
  const existingCount = await prisma.client.count();
  if (existingCount > 0) {
    console.log("Clients already exist — skipping demo seed.");
    return;
  }

  for (const c of CLIENTS) {
    const cs = CONTRACT_START[c.code];
    const totalMonths = TOTAL_MONTHS_OF[c.code] || 6;
    const contractStart = c.contractStart ?? (cs ? new Date(cs.y, cs.m - 1, 1) : undefined);
    const contractEnd =
      c.contractEnd !== undefined ? c.contractEnd : cs ? new Date(cs.y, cs.m - 1 + totalMonths, 1) : undefined;

    await prisma.client.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        name: c.name,
        type: c.type,
        owner: c.owner,
        editor: c.editor,
        stage: c.stage,
        lane: c.lane,
        note: c.note,
        contact: c.contact,
        email: c.email,
        plan: c.plan,
        contractStart,
        contractEnd,
        currentMonth: CURRENT_MONTH_OF[c.code],
        totalMonths,
        shootDate: c.shootDate,
        videosPerMonth: c.type === "RETAINER" ? 10 : 10,
      },
    });
  }

  // Promo pipeline videos (EC on queue, MI in internal review)
  const promoSpec: Array<[string, string[]]> = [
    ["EC", Array(10).fill("On Queue")],
    ["MI", Array(10).fill("Internal Review")],
  ];
  for (const [code, stages] of promoSpec) {
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const num = String(i + 1).padStart(3, "0");
      const ir = stage === "Internal Review" ? 1 : stage === "Client Review" || stage === "Final Delivery" ? 2 : 0;
      const cr = stage === "Client Review" ? 1 : stage === "Final Delivery" ? 2 : 0;
      await prisma.video.upsert({
        where: { code: code + num },
        update: {},
        create: {
          clientCode: code,
          code: code + num,
          title: VIDEO_TITLES[i % VIDEO_TITLES.length],
          stage,
          ir,
          cr,
        },
      });
    }
  }

  // Retainer monthly deliverables: months before current = Final Delivery, current month = On Queue
  for (const code of Object.keys(CURRENT_MONTH_OF)) {
    const curMo = CURRENT_MONTH_OF[code];
    for (let mo = 1; mo <= curMo; mo++) {
      const stage = mo < curMo ? "Final Delivery" : "On Queue";
      for (let n = 1; n <= 10; n++) {
        const code2 = code + String(mo).padStart(2, "0") + String(n).padStart(2, "0");
        await prisma.video.upsert({
          where: { code: code2 },
          update: {},
          create: { clientCode: code, code: code2, stage, month: mo, num: n },
        });
      }
    }
  }

  // Seed task status overrides matching the design reference (EC content-plan tasks done; MI further along)
  const taskSeed: Array<[string, string, string, string]> = [
    ["EC", "main", "plan", "Complete"],
    ["EC", "main", "approval", "Complete"],
    ["MI", "main", "plan", "Complete"],
    ["MI", "main", "bookapproval", "Complete"],
    ["MI", "main", "approval", "Complete"],
    ["MI", "main", "bookshoot", "Complete"],
    ["MI", "main", "shoot", "Complete"],
    ["MI", "main", "upload", "Complete"],
    ["MI", "main", "package", "Complete"],
    ["MI", "main", "editing", "Complete"],
  ];
  for (const [clientCode, scopeKey, taskId, status] of taskSeed) {
    await prisma.task.upsert({
      where: { clientCode_scopeKey_taskId: { clientCode, scopeKey, taskId } },
      update: { status },
      create: { clientCode, scopeKey, taskId, status },
    });
  }

  // Promo onboarding checklist defaults (both EC and MI are past onboarding -> all complete)
  for (const code of ["EC", "MI"]) {
    for (const t of ONBOARDING_TASK_DEFS) {
      await prisma.task.upsert({
        where: { clientCode_scopeKey_taskId: { clientCode: code, scopeKey: "onb", taskId: t.id } },
        update: {},
        create: { clientCode: code, scopeKey: "onb", taskId: t.id, status: "Complete" },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
