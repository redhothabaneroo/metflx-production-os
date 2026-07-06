import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function DetailIndexPage() {
  const first = await prisma.client.findFirst({ orderBy: { createdAt: "asc" } });
  redirect(`/detail/${first?.code || "LN"}`);
}
