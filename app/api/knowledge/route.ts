import { NextRequest, NextResponse } from "next/server";
import { listDashboardClients, getClientDetail } from "@/lib/data";

export const dynamic = "force-dynamic";

// UI-only styling keys (hex colors, font weights) used to render the
// dashboard — not substantive data, so they're stripped before this
// response reaches an LLM. Everything else (labels, statuses as plain
// text, dates, owners, codes) passes through untouched.
const STYLE_KEYS = new Set([
  "typeBg",
  "typeFg",
  "dotBg",
  "dotBorder",
  "leftLineBg",
  "fg",
  "weight",
  "ownerBg",
  "ownerFg",
  "statusBg",
  "statusFg",
  "statusDot",
  "statusBorder",
  "bg",
]);

function stripStyleFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripStyleFields(item)) as T;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (STYLE_KEYS.has(key)) continue;
      result[key] = stripStyleFields(val);
    }
    return result as T;
  }
  return value;
}

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
      const cleaned = stripStyleFields(clientDetail);
      return NextResponse.json({ matched: true, client: { ...cleaned, stage: matchedRow.stage } });
    }

    return NextResponse.json({ matched: false, clients: allClients.map((c) => ({ name: c.name, stage: c.stage })) });
  } catch (error) {
    console.error("GET /api/knowledge failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
