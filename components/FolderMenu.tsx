"use client";

import { useState } from "react";
import Link from "next/link";
import AddClientButton from "./AddClientButton";
import type { getClientDetail } from "@/lib/data";

type Menu = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>["menu"];

const MONO = "'IBM Plex Mono', monospace";

export default function FolderMenu({ menu }: { menu: Menu }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <aside style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: "14px 10px", position: "sticky", top: 0 }}>
      <AddClientButton />
      <div style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".1em", color: "#9aa1aa", padding: "4px 8px 10px" }}>Clients</div>
      {menu.map((g) => {
        const expanded = !collapsed[g.label];
        return (
          <div key={g.label} style={{ marginBottom: 8 }}>
            <div
              onClick={() => setCollapsed((s) => ({ ...s, [g.label]: !s[g.label] }))}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", cursor: "pointer" }}
            >
              <span style={{ fontSize: 9, color: "#aeb4bd", width: 8, flexShrink: 0 }}>{expanded ? "▾" : "▸"}</span>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: g.dot }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{g.label}</span>
              <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10, color: "#aeb4bd" }}>{g.count}</span>
            </div>
            {expanded &&
              g.clients.map((c) => (
                <Link
                  key={c.code}
                  href={`/detail/${c.code}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    width: "100%",
                    border: "none",
                    background: c.active ? "#f1f3f6" : "transparent",
                    borderRadius: 8,
                    padding: "8px 8px 8px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    marginBottom: 1,
                    textDecoration: "none",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b6bcc4" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: c.active ? "#1a1d21" : "#5b6470", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                    {c.name}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4, background: c.badgeBg, color: c.badgeFg, flexShrink: 0 }}>{c.code}</span>
                </Link>
              ))}
          </div>
        );
      })}
    </aside>
  );
}
