"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  onClose,
  maxWidth = 460,
  children,
}: {
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,18,22,0.42)",
        zIndex: 50,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "60px 20px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fadeup"
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth, boxShadow: "0 20px 60px rgba(10,10,10,0.28)" }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export const labelStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 9.5,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  color: "#9aa1aa",
  marginBottom: 6,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #dde1e6",
  borderRadius: 9,
  padding: "11px 12px",
  font: "400 13px 'IBM Plex Sans'",
  color: "#1a1d21",
  outline: "none",
  boxSizing: "border-box",
};
