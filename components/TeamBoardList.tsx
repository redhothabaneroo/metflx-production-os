"use client";

import { useState } from "react";
import Link from "next/link";
import TaskRow from "./TaskRow";
import { isTaskDone } from "@/lib/business";
import type { getTeamBoard } from "@/lib/data";

const MONO = "'IBM Plex Mono', monospace";

type Groups = Awaited<ReturnType<typeof getTeamBoard>>;

export default function TeamBoardList({ groups, name }: { groups: Groups; name: string }) {
  const [showComplete, setShowComplete] = useState(false);

  const visibleGroups = groups
    .map((g) => ({ ...g, tasks: showComplete ? g.tasks : g.tasks.filter((t) => !isTaskDone(t.status)) }))
    .filter((g) => g.tasks.length > 0);

  const hiddenCount = groups.reduce((a, g) => a + g.tasks.filter((t) => isTaskDone(t.status)).length, 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, color: "#5b6470" }}>
          {showComplete ? "Showing all tasks." : hiddenCount > 0 ? `${hiddenCount} completed task${hiddenCount === 1 ? "" : "s"} hidden.` : "No completed tasks yet."}
        </div>
        <button
          onClick={() => setShowComplete((s) => !s)}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 7,
            border: `1px solid ${showComplete ? "#3754db" : "#dde1e6"}`,
            background: showComplete ? "#eef1fd" : "#fff",
            color: showComplete ? "#3754db" : "#5b6470",
            borderRadius: 8,
            padding: "7px 12px",
            cursor: "pointer",
            font: "600 12px 'IBM Plex Sans'",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {showComplete ? "Hide complete" : "Show complete"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {visibleGroups.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 28, textAlign: "center", color: "#9aa1aa", fontSize: 13 }}>
            {groups.length === 0 ? `No tasks assigned to ${name} right now.` : "All caught up — nothing outstanding."}
          </div>
        )}
        {visibleGroups.map((g) => {
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
