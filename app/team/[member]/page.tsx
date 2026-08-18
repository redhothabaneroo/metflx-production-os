import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamBoard, listClientOptions } from "@/lib/data";
import { TEAM_MEMBERS, avatar, isTaskDone } from "@/lib/business";
import { PageHeader } from "@/components/PageHeaderContext";
import TeamBoardList from "@/components/TeamBoardList";
import AddTaskButton from "@/components/AddTaskButton";

export const dynamic = "force-dynamic";

export default async function TeamMemberPage({ params }: { params: Promise<{ member: string }> }) {
  const { member } = await params;
  const name = TEAM_MEMBERS.find((m) => m.toLowerCase() === member.toLowerCase());
  if (!name) notFound();

  const groups = await getTeamBoard(name);
  const clientOptions = await listClientOptions();
  const total = groups.reduce((a, g) => a + g.tasks.length, 0);
  const done = groups.reduce((a, g) => a + g.tasks.filter((t) => isTaskDone(t.status)).length, 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", animation: "fadeup .4s ease-out" }}>
      <PageHeader title="Team Boards" subtitle={`${name} · ${done}/${total} tasks complete`} />

      <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center" }}>
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
        <div style={{ marginLeft: "auto" }}>
          <AddTaskButton clientOptions={clientOptions} member={name} />
        </div>
      </div>

      <TeamBoardList groups={groups} name={name} />
    </div>
  );
}
