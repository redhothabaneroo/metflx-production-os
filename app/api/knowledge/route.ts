import { NextRequest, NextResponse } from "next/server";
import { listDashboardClients, getClientDetail } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.KNOWLEDGE_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = (request.nextUrl.searchParams.get("query") || "").trim();

  try {
    const { retainers, repeats, promos } = await listDashboardClients();
    const allClients = [...retainers, ...repeats, ...promos];

    const matchedRow = query
      ? allClients.find((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      : undefined;

    if (matchedRow) {
      const detail = await getClientDetail(matchedRow.code);
      if (!detail) {
        return NextResponse.json({ matched: false, clients: allClients.map((c) => ({ name: c.name, stage: c.stage })) });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { menu, stepper, ...clientDetail } = detail;
      return NextResponse.json({ matched: true, client: { ...clientDetail, stage: matchedRow.stage } });
    }

    return NextResponse.json({ matched: false, clients: allClients.map((c) => ({ name: c.name, stage: c.stage })) });
  } catch (error) {
    console.error("GET /api/knowledge failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
