"use client";

import { useState } from "react";
import TaskRow from "./TaskRow";
import { isTaskDone } from "@/lib/business";
import type { getClientDetail } from "@/lib/data";

type Detail = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>;

export default function OnboardingCard({ code, onboarding }: { code: string; onboarding: Detail["onboarding"] }) {
  const [expanded, setExpanded] = useState(!onboarding.allComplete);
  const [showComplete, setShowComplete] = useState(false);
  const visibleTasks = showComplete ? onboarding.tasks : onboarding.tasks.filter((t) => !isTaskDone(t.status));

  return (
    <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div onClick={() => setExpanded((e) => !e)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: "#9aa1aa", width: 10 }}>{expanded ? "▾" : "▸"}</span>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Onboarding</div>
          {onboarding.allComplete && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#15803d", background: "#e9f6ee", borderRadius: 20, padding: "3px 10px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Complete
            </span>
          )}
          <span style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8a9099" }}>
            {onboarding.done}/{onboarding.total}
          </span>
        </div>
        {expanded && (
          <button
            onClick={() => setShowComplete((s) => !s)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: `1px solid ${showComplete ? "#3754db" : "#dde1e6"}`,
              background: showComplete ? "#eef1fd" : "#fff",
              color: showComplete ? "#3754db" : "#5b6470",
              borderRadius: 7,
              padding: "5px 10px",
              cursor: "pointer",
              font: "600 11px 'IBM Plex Sans'",
              flexShrink: 0,
            }}
          >
            {showComplete ? "Hide complete" : "Show complete"}
          </button>
        )}
      </div>
      {expanded && (
        <div style={{ marginTop: 6 }}>
          {visibleTasks.length === 0 && (
            <div style={{ padding: "20px 8px", textAlign: "center", color: "#9aa1aa", fontSize: 12.5, borderTop: "1px solid #eef0f3" }}>All caught up — nothing outstanding.</div>
          )}
          {visibleTasks.map((t) => (
            <TaskRow key={t.id} task={t} clientCode={code} scopeKey="onb" statusOptions={["Not started", "In progress", "Complete", "Not applicable", "Pending"]} />
          ))}
        </div>
      )}
    </div>
  );
}
