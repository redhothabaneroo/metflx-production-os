"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Toast({ message, onView, onDismiss }: { message: string; onView: () => void; onDismiss: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="fadeup"
      style={{
        position: "fixed",
        bottom: 26,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#1a1d21",
        color: "#fff",
        borderRadius: 11,
        padding: "13px 16px 13px 18px",
        boxShadow: "0 12px 32px rgba(10,10,10,0.3)",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#16a34a" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="11" />
        <path d="M17 9l-6 6-3-3" stroke="#fff" strokeWidth="2.4" fill="none" />
      </svg>
      <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>{message}</span>
      <button onClick={onView} style={{ border: "none", background: "#2b2f36", color: "#fff", font: "600 12px 'IBM Plex Sans'", borderRadius: 7, padding: "7px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>
        View
      </button>
      <button onClick={onDismiss} style={{ border: "none", background: "transparent", color: "#8a9099", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 2 }}>
        ✕
      </button>
    </div>,
    document.body
  );
}
