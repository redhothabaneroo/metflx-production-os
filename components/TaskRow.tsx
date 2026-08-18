"use client";

import { useState, useEffect, useTransition } from "react";
import { updateTaskStatus, updateTaskOwner } from "@/lib/actions";
import { TASK_STATUS_STYLE, avatar } from "@/lib/business";

const MONO = "'IBM Plex Mono', monospace";

type Task = {
  id: string;
  label: string;
  owner: string;
  ownerBg: string;
  ownerFg: string;
  ownerInit: string;
  status: string;
  statusBg: string;
  statusFg: string;
  statusDot: string;
  statusBorder: string;
  ownerEditable?: boolean;
};

export default function TaskRow({
  task,
  clientCode,
  scopeKey,
  statusOptions,
  dueDate,
  dueDateRaw,
  onStatusChangeOverride,
  onDueDateChange,
  onDelete,
}: {
  task: Task;
  clientCode: string;
  scopeKey: string;
  statusOptions: string[];
  dueDate?: string | null;
  dueDateRaw?: string | null;
  onStatusChangeOverride?: (value: string) => void;
  onDueDateChange?: (value: string) => void;
  onDelete?: () => void;
}) {
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState(task.status);
  const [owner, setOwner] = useState(task.owner);
  const [due, setDue] = useState(dueDateRaw || "");

  useEffect(() => setStatus(task.status), [task.status]);
  useEffect(() => setOwner(task.owner), [task.owner]);
  useEffect(() => setDue(dueDateRaw || ""), [dueDateRaw]);

  const onDueChange = (value: string) => {
    setDue(value);
    onDueDateChange?.(value);
  };

  const s = TASK_STATUS_STYLE[status] || { bg: task.statusBg, fg: task.statusFg, dot: task.statusDot, border: task.statusBorder };
  const ow = avatar(owner);

  const onStatusChange = (value: string) => {
    setStatus(value);
    if (onStatusChangeOverride) {
      onStatusChangeOverride(value);
    } else {
      startTransition(() => updateTaskStatus(clientCode, scopeKey, task.id, value));
    }
  };
  const onOwnerChange = (value: string) => {
    setOwner(value);
    startTransition(() => updateTaskOwner(clientCode, scopeKey, task.id, value));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 2px", borderTop: "1px solid #eef0f3" }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: ow.bg,
          color: ow.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9.5,
          fontWeight: 600,
          flexShrink: 0,
          transition: "background-color 150ms ease, color 150ms ease",
        }}
      >
        {ow.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{task.label}</div>
        {task.ownerEditable ? (
          <select
            value={owner}
            onChange={(e) => onOwnerChange(e.target.value)}
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              font: "500 11px 'IBM Plex Sans'",
              color: "#3754db",
              marginTop: 1,
              textDecoration: "underline",
              textDecorationColor: "#c7d0e8",
            }}
          >
            <option value="Sam">Sam</option>
            <option value="Jordan">Jordan</option>
            <option value="Casey">Casey</option>
            <option value="Alex">Alex</option>
          </select>
        ) : (
          <div style={{ fontSize: 11, color: "#9aa1aa", marginTop: 1 }}>{task.owner}</div>
        )}
      </div>
      {onDueDateChange ? (
        <input
          type="date"
          value={due}
          onChange={(e) => onDueChange(e.target.value)}
          style={{
            width: 108,
            flexShrink: 0,
            border: "1px solid #dde1e6",
            borderRadius: 6,
            padding: "5px 6px",
            fontFamily: MONO,
            fontSize: 11,
            color: due ? "#5b6470" : "#c4c9d0",
            cursor: "pointer",
            background: "#fff",
          }}
        />
      ) : (
        dueDate !== undefined && (
          <div style={{ width: 64, flexShrink: 0, fontFamily: MONO, fontSize: 11, color: dueDate ? "#5b6470" : "#c4c9d0", textAlign: "right" }}>{dueDate || "—"}</div>
        )
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: 11, width: 7, height: 7, borderRadius: "50%", background: s.dot, pointerEvents: "none", transition: "background-color 150ms ease" }} />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            border: `1px solid ${s.border}`,
            cursor: "pointer",
            font: "600 11px 'IBM Plex Sans'",
            padding: "6px 26px 6px 25px",
            borderRadius: 7,
            background: s.bg,
            color: s.fg,
            transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
          }}
        >
          {statusOptions.map((so) => (
            <option key={so} value={so}>
              {so}
            </option>
          ))}
        </select>
        <svg style={{ position: "absolute", right: 9, pointerEvents: "none", transition: "stroke 150ms ease" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={s.fg} strokeWidth="2.4">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          title="Delete task"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            flexShrink: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#c4c9d0",
            borderRadius: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
