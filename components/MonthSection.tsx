"use client";

import { useState, useTransition } from "react";
import TaskRow from "./TaskRow";
import ContentPlanSection from "./ContentPlanSection";
import { updateShootDate, setDateNotApplicable } from "@/lib/actions";
import { isTaskDone } from "@/lib/business";
import type { getClientDetail } from "@/lib/data";

const MONO = "'IBM Plex Mono', monospace";

type Detail = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>;
type Section = Detail["monthSections"][number];

function DateFieldRow({
  label,
  value,
  notApplicable,
  onChangeDate,
  onToggleNotApplicable,
}: {
  label: string;
  value: string;
  notApplicable?: boolean;
  onChangeDate: (value: string) => void;
  onToggleNotApplicable?: (value: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fafbfc", border: "1px solid #eef0f3", borderRadius: 9, padding: "10px 12px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: ".08em", color: "#9aa1aa" }}>{label}</div>
      {notApplicable ? (
        <span style={{ font: "600 12.5px 'IBM Plex Sans'", color: "#9aa1aa" }}>Not applicable</span>
      ) : (
        <input
          type="date"
          defaultValue={value}
          onChange={(e) => onChangeDate(e.target.value)}
          style={{ font: "600 12.5px 'IBM Plex Sans'", color: value ? "#1a1d21" : "#9aa1aa", border: "1px solid #dde1e6", borderRadius: 7, padding: "6px 9px", background: "#fff" }}
        />
      )}
      {onToggleNotApplicable && (
        <button
          onClick={() => onToggleNotApplicable(!notApplicable)}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: `1px solid ${notApplicable ? "#3754db" : "#dde1e6"}`,
            background: notApplicable ? "#eef1fd" : "#fff",
            color: notApplicable ? "#3754db" : "#5b6470",
            borderRadius: 7,
            padding: "5px 10px",
            cursor: "pointer",
            font: "600 11px 'IBM Plex Sans'",
            flexShrink: 0,
          }}
        >
          {notApplicable ? "Mark applicable" : "N/A"}
        </button>
      )}
    </div>
  );
}

export default function MonthSection({ clientCode, section }: { clientCode: string; section: Section }) {
  const [expanded, setExpanded] = useState(section.defaultOpen);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [delivOpen, setDelivOpen] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [, startTransition] = useTransition();
  const scopeKey = `m${section.month}`;
  const visibleTasks = showComplete ? section.tasks : section.tasks.filter((t) => !isTaskDone(t.status));

  return (
    <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <span style={{ fontSize: 11, color: "#9aa1aa", width: 10 }}>{expanded ? "▾" : "▸"}</span>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{section.label}</div>
        {section.isComplete && (
          <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 5, background: "#e9f6ee", color: "#15803d" }}>
            Complete
          </span>
        )}
        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#8a9099" }}>
          {section.tasksDone}/{section.tasksTotal} tasks · {section.delivDone}/{section.delivTotal} deliverables
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DateFieldRow
              label="Discovery call date"
              value={section.discoveryDate}
              notApplicable={section.discoveryNotApplicable}
              onChangeDate={(value) => startTransition(() => updateShootDate(clientCode, `${scopeKey}-discovery`, value))}
              onToggleNotApplicable={(value) => startTransition(() => setDateNotApplicable(clientCode, `${scopeKey}-discovery`, value))}
            />
            <DateFieldRow
              label="Content plan approval date"
              value={section.approvalDate}
              notApplicable={section.approvalNotApplicable}
              onChangeDate={(value) => startTransition(() => updateShootDate(clientCode, `${scopeKey}-approval`, value))}
              onToggleNotApplicable={(value) => startTransition(() => setDateNotApplicable(clientCode, `${scopeKey}-approval`, value))}
            />
            <DateFieldRow label="Shoot date" value={section.shootDate} onChangeDate={(value) => startTransition(() => updateShootDate(clientCode, scopeKey, value))} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6, gap: 10 }}>
              <div onClick={() => setTasksOpen((s) => !s)} style={{ display: "flex", alignItems: "center", cursor: "pointer", flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, color: "#9aa1aa", width: 14 }}>{tasksOpen ? "▾" : "▸"}</span>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Tasks</div>
                <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#8a9099" }}>
                  {section.tasksDone}/{section.tasksTotal}
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
              <div style={{ padding: "20px 8px", textAlign: "center", color: "#9aa1aa", fontSize: 12, borderTop: "1px solid #eef0f3" }}>All caught up — nothing outstanding.</div>
            )}
            {tasksOpen &&
              visibleTasks.map((t) => (
                <TaskRow key={t.id} task={t} clientCode={clientCode} scopeKey={scopeKey} statusOptions={["Not started", "In progress", "Complete", "Not applicable", "Pending"]} />
              ))}
          </div>

          <div>
            <div onClick={() => setDelivOpen((s) => !s)} style={{ display: "flex", alignItems: "center", marginBottom: 6, cursor: "pointer" }}>
              <span style={{ fontSize: 11, color: "#9aa1aa", width: 14 }}>{delivOpen ? "▾" : "▸"}</span>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Deliverables</div>
              <span style={{ marginLeft: 10, fontFamily: MONO, fontSize: 11, color: "#8a9099" }}>
                {section.delivDone}/{section.delivTotal}
              </span>
            </div>
            {delivOpen &&
              (section.hasDeliverables ? (
                section.deliverables.map((v) => (
                  <div key={v.code} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 2px", borderTop: "1px solid #eef0f3" }}>
                    <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: "#1a1d21", width: 48 }}>{v.code}</div>
                    <div style={{ flex: 1, minWidth: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: 11, color: "#7b828c", width: 60, textAlign: "right" }}>{v.dueDate}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".03em", padding: "4px 9px", borderRadius: 6, background: v.statusBg, color: v.statusFg, width: 118, textAlign: "center" }}>{v.status}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: "20px 8px", textAlign: "center", color: "#9aa1aa", fontSize: 12, borderTop: "1px solid #eef0f3" }}>No deliverables yet for this month.</div>
              ))}
          </div>

          <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 14 }}>
            <ContentPlanSection clientCode={clientCode} scopeKey={scopeKey} concepts={section.contentPlan} bare />
          </div>
        </div>
      )}
    </div>
  );
}
