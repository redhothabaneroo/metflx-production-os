"use client";

import { usePageHeaderContext } from "./PageHeaderContext";

export default function Topbar() {
  const { header } = usePageHeaderContext();
  return (
    <header
      style={{
        height: 60,
        flexShrink: 0,
        background: "#fff",
        borderBottom: "1px solid #e3e6ea",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 26px",
      }}
    >
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-.01em" }}>{header.title}</div>
        <div style={{ fontSize: 11.5, color: "#8a9099" }}>{header.subtitle}</div>
      </div>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f1f3f6",
          border: "1px solid #e3e6ea",
          borderRadius: 8,
          padding: "8px 12px",
          width: 260,
          color: "#9aa1aa",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4-4" />
        </svg>
        <span style={{ fontSize: 12.5 }}>Search clients, edits…</span>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8a9099", letterSpacing: ".04em" }}>
        TUE · JUN 24
      </div>
    </header>
  );
}
