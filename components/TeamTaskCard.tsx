"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/lib/actions";
import { TASK_STATUS_STYLE, TASK_STATUS_OPTIONS } from "@/lib/business";

const MONO = "'IBM Plex Mono', monospace";

type Item = {
  clientCode: string;
  clientName: string;
  clientType: string;
  typeBg: string;
  typeFg: string;
  taskId: string;
  scopeKey: string;
  label: string;
  status: string;
  statusBg: string;
  statusFg: string;
  statusDot: string;
  statusBorder: string;
};

export default function TeamTaskCard({ item }: { item: Item }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState(item.status);

  useEffect(() => setStatus(item.status), [item.status]);

  const s = TASK_STATUS_STYLE[status] || { bg: item.statusBg, fg: item.statusFg, dot: item.statusDot, border: item.statusBorder };

  const onStatusChange = (value: string) => {
    setStatus(value);
    startTransition(() => updateTaskStatus(item.clientCode, item.scopeKey, item.taskId, value));
  };

  return (
    <div
      className="hover-card"
      style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 9 }}
    >
      <div onClick={() => router.push(`/detail/${item.clientCode}`)} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 8.5,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            padding: "2px 6px",
            borderRadius: 4,
            background: item.typeBg,
            color: item.typeFg,
            flexShrink: 0,
          }}
        >
          {item.clientCode}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.clientName}</span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.3 }}>{item.label}</div>
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
            width: "100%",
            transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
          }}
        >
          {TASK_STATUS_OPTIONS.map((so) => (
            <option key={so} value={so}>
              {so}
            </option>
          ))}
        </select>
        <svg style={{ position: "absolute", right: 9, pointerEvents: "none" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={s.fg} strokeWidth="2.4">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
