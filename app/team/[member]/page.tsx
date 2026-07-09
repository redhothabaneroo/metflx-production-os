import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamBoard } from "@/lib/data";
import { TEAM_MEMBERS, avatar } from "@/lib/business";
import { PageHeader } from "@/components/PageHeaderContext";
import TeamTaskCard from "@/components/TeamTaskCard";

export const dynamic = "force-dynamic";

export default async function TeamMemberPage({ params }: { params: Promise<{ member: string }> }) {
  const { member } = await params;
  const name = TEAM_MEMBERS.find((m) => m.toLowerCase() === member.toLowerCase());
  if (!name) notFound();

  const columns = await getTeamBoard(name);
  const total = columns.reduce((a, c) => a + c.items.length, 0);
  const av = avatar(name);

  return (
    <div style={{ animation: "fadeup .4s ease-out" }}>
      <PageHeader title="Team Boards" subtitle={`${name} · ${total} assigned task${total === 1 ? "" : "s"}`} />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {TEAM_MEMBERS.map((m) => {
          const active = m === name;
          const a = avatar(m);
          return (
            <Link
              key={m}
              href={`/team/${m.toLowerCase()}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 9,
                textDecoration: "none",
                background: active ? "#1a1d21" : "#fff",
                border: `1px solid ${active ? "#1a1d21" : "#e3e6ea"}`,
                color: active ? "#fff" : "#1a1d21",
                font: "600 12.5px 'IBM Plex Sans'",
              }}
            >
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: active ? "rgba(255,255,255,0.15)" : a.bg, color: active ? "#fff" : a.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600 }}>
                {a.initials}
              </span>
              {m}
            </Link>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 14 }}>
        {columns.map((col) => (
          <div key={col.status} style={{ width: 280, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 10px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{col.status}</div>
              <div style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#9aa1aa" }}>{col.items.length}</div>
            </div>
            <div style={{ minHeight: 140, background: "#fafbfc", border: "1px dashed #e1e4e8", borderRadius: 12, padding: 9, display: "flex", flexDirection: "column", gap: 9 }}>
              {col.items.length === 0 && <div style={{ fontSize: 12, color: "#9aa1aa", padding: "10px 4px" }}>Nothing here.</div>}
              {col.items.map((item) => (
                <TeamTaskCard key={`${item.clientCode}:${item.scopeKey}:${item.taskId}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
