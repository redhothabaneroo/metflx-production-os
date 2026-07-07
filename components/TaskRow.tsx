"use client";

import { useState, useEffect, useTransition } from "react";
import { updateTaskStatus, updateTaskOwner } from "@/lib/actions";
import { TASK_STATUS_STYLE, avatar } from "@/lib/business";

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
}: {
  task: Task;
  clientCode: string;
  scopeKey: string;
  statusOptions: string[];
}) {
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState(task.status);
  const [owner, setOwner] = useState(task.owner);

  useEffect(() => setStatus(task.status), [task.status]);
  useEffect(() => setOwner(task.owner), [task.owner]);

  const s = TASK_STATUS_STYLE[status] || { bg: task.statusBg, fg: task.statusFg, dot: task.statusDot, border: task.statusBorder };
  const ow = avatar(owner);

  const onStatusChange = (value: string) => {
    setStatus(value);
    startTransition(() => updateTaskStatus(clientCode, scopeKey, task.id, value));
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
            <option value="Thomas">Thomas</option>
            <option value="Brody">Brody</option>
          </select>
        ) : (
          <div style={{ fontSize: 11, color: "#9aa1aa", marginTop: 1 }}>{task.owner}</div>
        )}
      </div>
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
    </div>
  );
}
