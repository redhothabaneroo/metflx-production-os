"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { VIDEO_TITLES, PROMO_STAGE_OPTIONS, RETAINER_STAGE_OPTIONS, isRecurring } from "./business";

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  revalidatePath("/schedule");
  revalidatePath("/clients");
  revalidatePath("/detail", "layout");
}

export async function createClient(input: {
  type: "Retainer" | "Promo" | "Repeat";
  business: string;
  contact: string;
  email: string;
  videos: string;
  start: string;
  end: string;
}) {
  const business = input.business.trim();
  const words = business.split(/\s+/);
  let base = (words.length > 1 ? words[0][0] + words[1][0] : business.slice(0, 2)).toUpperCase();
  const existing = await prisma.client.findMany({ select: { code: true } });
  const used = new Set(existing.map((c) => c.code));
  let code = base;
  let n = 2;
  while (used.has(code)) {
    code = base + n;
    n++;
  }

  const num = Math.max(0, Math.min(30, parseInt(input.videos, 10) || 0));
  const type = input.type === "Retainer" ? "RETAINER" : input.type === "Repeat" ? "REPEAT" : "PROMO";
  const start = input.start ? new Date(input.start + "T00:00:00") : null;
  const end = input.end ? new Date(input.end + "T00:00:00") : null;

  await prisma.client.create({
    data: {
      code,
      name: business,
      type,
      owner: "Priya",
      stage: "Onboarding",
      lane: "Onboarding",
      note: "New client — onboarding just started.",
      contact: input.contact.trim(),
      email: input.email.trim(),
      plan: num ? (isRecurring(type) ? `${num} videos / month` : `${num}-video promo package`) : "—",
      contractStart: start,
      contractEnd: end,
      currentMonth: isRecurring(type) ? 1 : null,
      totalMonths: 6,
      videosPerMonth: num || null,
    },
  });

  if (num > 0) {
    if (isRecurring(type)) {
      await prisma.video.createMany({
        data: Array.from({ length: num }, (_, i) => {
          const n = i + 1;
          return {
            clientCode: code,
            month: 1,
            num: n,
            code: code + "01" + String(n).padStart(2, "0"),
            stage: "On Queue",
          };
        }),
      });
    } else {
      await prisma.video.createMany({
        data: Array.from({ length: num }, (_, i) => ({
          clientCode: code,
          code: code + String(i + 1).padStart(3, "0"),
          title: VIDEO_TITLES[i % VIDEO_TITLES.length],
          stage: "On Queue",
        })),
      });
    }
  }

  revalidateAll();
  return { code };
}

export async function addVideos(input: { clientCode: string; count: string; stage: string; month?: string }) {
  const client = await prisma.client.findUnique({ where: { code: input.clientCode } });
  if (!client) throw new Error("Client not found");
  const count = Math.max(0, Math.min(30, parseInt(input.count, 10) || 0));
  const isRetainer = isRecurring(client.type);
  const stageOptions = isRetainer ? RETAINER_STAGE_OPTIONS : PROMO_STAGE_OPTIONS;
  const stage = stageOptions.includes(input.stage) ? input.stage : stageOptions[0];

  if (isRetainer) {
    const mo = parseInt(input.month || "1", 10) || 1;
    const existing = await prisma.video.findMany({ where: { clientCode: input.clientCode, month: mo } });
    let maxNum = existing.reduce((a, v) => Math.max(a, v.num || 0), 0);
    if (count > 0) {
      await prisma.video.createMany({
        data: Array.from({ length: count }, () => {
          const num = ++maxNum;
          return {
            clientCode: input.clientCode,
            month: mo,
            num,
            code: input.clientCode + String(mo).padStart(2, "0") + String(num).padStart(2, "0"),
            stage,
          };
        }),
      });
    }
    revalidateAll();
    return { message: `Added ${count} video${count > 1 ? "s" : ""} to ${client.name} — Month ${mo}` };
  } else {
    const existing = await prisma.video.findMany({ where: { clientCode: input.clientCode, month: null } });
    let maxNum = existing.reduce((a, v) => Math.max(a, parseInt(v.code.replace(input.clientCode, ""), 10) || 0), 0);
    if (count > 0) {
      await prisma.video.createMany({
        data: Array.from({ length: count }, () => {
          const num = ++maxNum;
          return {
            clientCode: input.clientCode,
            code: input.clientCode + String(num).padStart(3, "0"),
            title: "New deliverable",
            stage,
          };
        }),
      });
    }
    revalidateAll();
    return { message: `Added ${count} video${count > 1 ? "s" : ""} to ${client.name}` };
  }
}

export async function updateVideoStage(ids: number[], stage: string) {
  if (!ids.length) return;
  await prisma.video.updateMany({ where: { id: { in: ids } }, data: { stage } });
  revalidateAll();
}

export async function updateTaskStatus(clientCode: string, scopeKey: string, taskId: string, status: string) {
  await prisma.task.upsert({
    where: { clientCode_scopeKey_taskId: { clientCode, scopeKey, taskId } },
    update: { status },
    create: { clientCode, scopeKey, taskId, status },
  });
  revalidatePath("/detail/" + clientCode);
  revalidatePath("/clients");
  revalidatePath("/schedule");
}

export async function updateTaskOwner(clientCode: string, scopeKey: string, taskId: string, owner: string) {
  const existing = await prisma.task.findUnique({ where: { clientCode_scopeKey_taskId: { clientCode, scopeKey, taskId } } });
  await prisma.task.upsert({
    where: { clientCode_scopeKey_taskId: { clientCode, scopeKey, taskId } },
    update: { owner },
    create: { clientCode, scopeKey, taskId, status: existing?.status || "Not started", owner },
  });
  revalidatePath("/detail/" + clientCode);
}

export async function updateTaskDueDate(clientCode: string, scopeKey: string, taskId: string, dueDate: string) {
  const existing = await prisma.task.findUnique({ where: { clientCode_scopeKey_taskId: { clientCode, scopeKey, taskId } } });
  const parsed = dueDate ? new Date(dueDate + "T00:00:00") : null;
  await prisma.task.upsert({
    where: { clientCode_scopeKey_taskId: { clientCode, scopeKey, taskId } },
    update: { dueDate: parsed },
    create: { clientCode, scopeKey, taskId, status: existing?.status || "Not started", dueDate: parsed },
  });
  revalidatePath("/detail/" + clientCode);
  revalidatePath("/team", "layout");
}

export async function updateShootDate(clientCode: string, scopeKey: string, date: string) {
  if (!date) {
    await prisma.shootDate.deleteMany({ where: { clientCode, scopeKey } });
  } else {
    await prisma.shootDate.upsert({
      where: { clientCode_scopeKey: { clientCode, scopeKey } },
      update: { date: new Date(date + "T00:00:00") },
      create: { clientCode, scopeKey, date: new Date(date + "T00:00:00") },
    });
  }
  revalidatePath("/detail/" + clientCode);
  revalidatePath("/schedule");
}

export async function updateClientInfo(
  clientCode: string,
  fields: Partial<{ contact: string; email: string; plan: string; contractStart: string; contractEnd: string; totalMonths: number }>
) {
  const data: Record<string, unknown> = {};
  if (fields.contact !== undefined) data.contact = fields.contact;
  if (fields.email !== undefined) data.email = fields.email;
  if (fields.plan !== undefined) data.plan = fields.plan;
  if (fields.contractStart !== undefined) data.contractStart = fields.contractStart ? new Date(fields.contractStart + "T00:00:00") : null;
  if (fields.contractEnd !== undefined) data.contractEnd = fields.contractEnd ? new Date(fields.contractEnd + "T00:00:00") : null;
  if (fields.totalMonths !== undefined) data.totalMonths = Math.max(1, Math.min(24, fields.totalMonths));
  await prisma.client.update({ where: { code: clientCode }, data });
  revalidatePath("/detail/" + clientCode);
  revalidatePath("/dashboard");
}

export async function updateFileLink(clientCode: string, tag: "RAW" | "FIO" | "DRV", link: string) {
  const field = tag === "RAW" ? "rawFolderLink" : tag === "FIO" ? "frameIoLink" : "finalDeliveryLink";
  await prisma.client.update({ where: { code: clientCode }, data: { [field]: link } });
  revalidatePath("/detail/" + clientCode);
}

export async function createCustomTask(input: { clientCode: string; label: string; owner: string; dueDate: string }) {
  await prisma.customTask.create({
    data: {
      clientCode: input.clientCode,
      label: input.label.trim(),
      owner: input.owner,
      dueDate: input.dueDate ? new Date(input.dueDate + "T00:00:00") : null,
    },
  });
  revalidatePath("/team", "layout");
}

export async function updateCustomTaskStatus(id: number, status: string) {
  await prisma.customTask.update({ where: { id }, data: { status } });
  revalidatePath("/team", "layout");
}

export async function deleteCustomTask(id: number) {
  await prisma.customTask.delete({ where: { id } });
  revalidatePath("/team", "layout");
}

export async function updateCustomTaskDueDate(id: number, dueDate: string) {
  await prisma.customTask.update({
    where: { id },
    data: { dueDate: dueDate ? new Date(dueDate + "T00:00:00") : null },
  });
  revalidatePath("/team", "layout");
}
