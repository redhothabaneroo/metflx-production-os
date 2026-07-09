"use client";

import { useState } from "react";
import TaskRow from "./TaskRow";
import type { getClientDetail } from "@/lib/data";

type Detail = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>;

export default function OnboardingCard({ code, onboarding }: { code: string; onboarding: Detail["onboarding"] }) {
  const [expanded, setExpanded] = useState(!onboarding.allComplete);

  return (
    <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
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
        <div style={{ marginTop: 6 }}>
          {onboarding.tasks.map((t) => (
            <TaskRow key={t.id} task={t} clientCode={code} scopeKey="onb" statusOptions={["Not started", "In progress", "Complete", "Not applicable", "Pending"]} />
          ))}
        </div>
      )}
    </div>
  );
}
