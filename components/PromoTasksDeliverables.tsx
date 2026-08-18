"use client";

import { useState } from "react";
import TaskRow from "./TaskRow";
import { isTaskDone } from "@/lib/business";
import type { getClientDetail } from "@/lib/data";

const MONO = "'IBM Plex Mono', monospace";

type Detail = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>;

export default function PromoTasksDeliverables({ code, detail }: { code: string; detail: Detail }) {
  const [tasksOpen, setTasksOpen] = useState(true);
  const [delivOpen, setDelivOpen] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const done = detail.tasks.filter((t) => t.status === "Complete" || t.status === "Not applicable").length;
  const delivDone = detail.deliverables.filter((v) => v.status === "Delivered").length;
  const visibleTasks = showComplete ? detail.tasks : detail.tasks.filter((t) => !isTaskDone(t.status));

  return (
    <>
      <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6, gap: 10 }}>
          <div onClick={() => setTasksOpen((s) => !s)} style={{ display: "flex", alignItems: "center", cursor: "pointer", flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, color: "#9aa1aa", width: 14 }}>{tasksOpen ? "▾" : "▸"}</span>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Tasks</div>
            <div style={{ fontSize: 11.5, color: "#9aa1aa", marginLeft: 10 }}>Set a status for each step</div>
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#8a9099" }}>
              {done}/{detail.tasks.length}
            </span>
          </div>
          {tasksOpen && (
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
        {tasksOpen && visibleTasks.length === 0 && (
          <div style={{ padding: "20px 8px", textAlign: "center", color: "#9aa1aa", fontSize: 12.5, borderTop: "1px solid #eef0f3" }}>All caught up — nothing outstanding.</div>
        )}
        {tasksOpen &&
          visibleTasks.map((t) => (
            <TaskRow key={t.id} task={t} clientCode={code} scopeKey="main" statusOptions={["Not started", "In progress", "Complete", "Pending"]} />
          ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
        <div onClick={() => setDelivOpen((s) => !s)} style={{ display: "flex", alignItems: "center", marginBottom: 14, cursor: "pointer" }}>
          <span style={{ fontSize: 11, color: "#9aa1aa", width: 14 }}>{delivOpen ? "▾" : "▸"}</span>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Deliverables</div>
          <span style={{ marginLeft: 10, fontFamily: MONO, fontSize: 11, color: "#8a9099" }}>
            {delivDone}/{detail.deliverables.length}
          </span>
        </div>
        {delivOpen &&
          (detail.hasDeliverables ? (
            detail.deliverables.map((v) => (
              <div key={v.code} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 2px", borderTop: "1px solid #eef0f3" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: "#1a1d21", width: 48 }}>{v.code}</div>
                <div style={{ flex: 1, minWidth: 0 }} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#7b828c", width: 60, textAlign: "right" }}>{v.dueDate}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".03em", padding: "4px 9px", borderRadius: 6, background: v.statusBg, color: v.statusFg, width: 118, textAlign: "center" }}>{v.status}</span>
              </div>
            ))
          ) : (
            <div style={{ padding: "28px 8px", textAlign: "center", color: "#9aa1aa", fontSize: 12.5, borderTop: "1px solid #eef0f3" }}>No video edits yet — still in onboarding / pre-production.</div>
          ))}
      </div>
    </>
  );
}
