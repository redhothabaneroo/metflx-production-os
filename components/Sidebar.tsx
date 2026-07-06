"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    href: "/pipeline",
    label: "Video Pipeline",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M7 3v18M17 3v18M2 9h5M2 15h5M17 9h5M17 15h5" />
      </svg>
    ),
  },
  {
    href: "/schedule",
    label: "Shoot Schedule",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    href: "/clients",
    label: "Client Pipeline",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="5" height="16" />
        <rect x="10" y="4" width="5" height="11" />
        <rect x="17" y="4" width="4" height="14" />
      </svg>
    ),
  },
  {
    href: "/detail",
    label: "Project Detail",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("sidebarCollapsed", !c ? "1" : "0");
      return !c;
    });
  };

  const off = "#9aa3b0";

  return (
    <aside
      style={{
        width: collapsed ? "66px" : "236px",
        flexShrink: 0,
        background: "#15181d",
        color: "#cbd0d8",
        display: "flex",
        flexDirection: "column",
        padding: `18px ${collapsed ? "9px" : "14px"}`,
        transition: "width 250ms cubic-bezier(0.22,1,0.36,1)",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 8px 14px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            background: "#3754db",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#fff",
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          M
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", letterSpacing: "-.01em", whiteSpace: "nowrap" }}>
              Metaflx Studio
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "#6b7280",
                whiteSpace: "nowrap",
              }}
            >
              Production OS
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 10,
          margin: "0 0 8px",
          padding: "8px 11px",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          background: "transparent",
          color: "#6b7280",
        }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: `rotate(${collapsed ? "180deg" : "0deg"})`,
            transition: "transform 250ms cubic-bezier(0.22,1,0.36,1)",
            flexShrink: 0,
          }}
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        {!collapsed && <span style={{ font: "500 12px 'IBM Plex Sans'", whiteSpace: "nowrap" }}>Collapse</span>}
      </button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "9px 11px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                font: "500 13px 'IBM Plex Sans'",
                textAlign: "left",
                background: active ? "#222831" : "transparent",
                color: active ? "#fff" : off,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          padding: 11,
          borderTop: "1px solid #262b33",
          display: "flex",
          alignItems: "center",
          gap: 9,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#3754db",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          PR
        </div>
        {!collapsed && (
          <div style={{ fontSize: 12, color: "#cbd0d8", whiteSpace: "nowrap" }}>Priya · Producer</div>
        )}
      </div>
    </aside>
  );
}
