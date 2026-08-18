"use client";

import { useState, useTransition } from "react";
import { updateFileLink } from "@/lib/actions";

const MONO = "'IBM Plex Mono', monospace";

type FileDef = { tag: string; bg: string; fg: string; name: string; link: string | null; showLink: boolean };

function FileRow({ code, f }: { code: string; f: FileDef }) {
  const [, startTransition] = useTransition();
  const [link, setLink] = useState(f.link || "");
  const [editing, setEditing] = useState(!f.link);

  const commit = () => {
    if (link.trim()) {
      setEditing(false);
      startTransition(() => updateFileLink(code, f.tag as "RAW" | "FIO" | "DRV", link.trim()));
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: "1px solid #e3e6ea", borderRadius: 9 }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: f.bg, color: f.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: MONO }}>
        {f.tag}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{f.name}</div>
        {editing ? (
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            onBlur={commit}
            placeholder="paste folder link"
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: 0, fontFamily: MONO, fontSize: 10.5, color: "#5b6470" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <a href={link} target="_blank" rel="noopener" style={{ fontFamily: MONO, fontSize: 10.5, color: "#3754db", textDecoration: "underline", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {link}
            </a>
            <button onClick={() => setEditing(true)} title="Edit link" style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#9aa1aa", flexShrink: 0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <a href={link || undefined} target="_blank" rel="noopener" style={{ display: "flex", opacity: link ? 1 : 0.35, pointerEvents: link ? "auto" : "none" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa1aa" strokeWidth="2">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </a>
    </div>
  );
}

export default function FilesLinksCard({ code, files }: { code: string; files: FileDef[] }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Files &amp; links</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {files.map((f) => (
          <FileRow key={f.tag} code={code} f={f} />
        ))}
      </div>
    </div>
  );
}
