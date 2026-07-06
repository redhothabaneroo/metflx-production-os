"use client";

import { useTransition } from "react";
import { updateTaskStatus, updateTaskOwner } from "@/lib/actions";

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

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 2px", borderTop: "1px solid #eef0f3" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: task.ownerBg, color: task.ownerFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 600, flexShrink: 0 }}>
        {task.ownerInit}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{task.label}</div>
        {task.ownerEditable ? (
          <select
            value={task.owner}
            onChange={(e) => startTransition(() => updateTaskOwner(clientCode, scopeKey, task.id, e.target.value))}
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
        <span style={{ position: "absolute", left: 11, width: 7, height: 7, borderRadius: "50%", background: task.statusDot, pointerEvents: "none" }} />
        <select
          value={task.status}
          onChange={(e) => startTransition(() => updateTaskStatus(clientCode, scopeKey, task.id, e.target.value))}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            border: `1px solid ${task.statusBorder}`,
            cursor: "pointer",
            font: "600 11px 'IBM Plex Sans'",
            padding: "6px 26px 6px 25px",
            borderRadius: 7,
            background: task.statusBg,
            color: task.statusFg,
          }}
        >
          {statusOptions.map((so) => (
            <option key={so} value={so}>
              {so}
            </option>
          ))}
        </select>
        <svg style={{ position: "absolute", right: 9, pointerEvents: "none" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={task.statusFg} strokeWidth="2.4">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
