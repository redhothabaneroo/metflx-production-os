"use client";

import { ReactNode } from "react";

export default function Modal({
  onClose,
  maxWidth = 460,
  children,
}: {
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}) {
  return (
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
    </div>
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
