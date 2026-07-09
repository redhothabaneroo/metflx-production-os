import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamBoard } from "@/lib/data";
import { TEAM_MEMBERS, avatar, isTaskDone } from "@/lib/business";
import { PageHeader } from "@/components/PageHeaderContext";
import TaskRow from "@/components/TaskRow";

export const dynamic = "force-dynamic";

const MONO = "'IBM Plex Mono', monospace";

export default async function TeamMemberPage({ params }: { params: Promise<{ member: string }> }) {
  const { member } = await params;
  const name = TEAM_MEMBERS.find((m) => m.toLowerCase() === member.toLowerCase());
  if (!name) notFound();

  const groups = await getTeamBoard(name);
  const total = groups.reduce((a, g) => a + g.tasks.length, 0);
  const done = groups.reduce((a, g) => a + g.tasks.filter((t) => isTaskDone(t.status)).length, 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", animation: "fadeup .4s ease-out" }}>
      <PageHeader title="Team Boards" subtitle={`${name} · ${done}/${total} tasks complete`} />

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

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {groups.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 28, textAlign: "center", color: "#9aa1aa", fontSize: 13 }}>
            No tasks assigned to {name} right now.
          </div>
        )}
        {groups.map((g) => {
          const groupDone = g.tasks.filter((t) => isTaskDone(t.status)).length;
          return (
            <div key={g.clientCode} style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
              <Link href={`/detail/${g.clientCode}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{g.clientName}</div>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 8.5,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: g.typeBg,
                    color: g.typeFg,
                  }}
                >
                  {g.clientType}
                </span>
                <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#8a9099" }}>
                  {groupDone}/{g.tasks.length}
                </span>
              </Link>
              <div style={{ marginTop: 6 }}>
                {g.tasks.map((t) => (
                  <TaskRow key={`${t.scopeKey}:${t.id}`} task={t} clientCode={g.clientCode} scopeKey={t.scopeKey} statusOptions={t.statusOptions} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
