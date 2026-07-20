"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateVideoStage } from "@/lib/actions";
import type { listKanbanBoard } from "@/lib/data";

const MONO = "'IBM Plex Mono', monospace";

type Columns = Awaited<ReturnType<typeof listKanbanBoard>>;
type Bucket = Columns[number]["buckets"][number];
type VideoCard = Bucket["videos"][number];

function moveVideos(columns: Columns, ids: number[], targetStage: string): Columns {
  const idSet = new Set(ids);
  const moved: { video: VideoCard; meta: Bucket }[] = [];

  const stripped = columns.map((col) => {
    const buckets = col.buckets
      .map((b) => {
        const staying = b.videos.filter((v) => !idSet.has(v.id));
        const moving = b.videos.filter((v) => idSet.has(v.id));
        moving.forEach((video) => moved.push({ video, meta: b }));
        return { ...b, videos: staying, count: staying.length };
      })
      .filter((b) => b.videos.length > 0);
    return { ...col, buckets, count: buckets.reduce((a, b) => a + b.count, 0) };
  });

  if (!moved.length) return stripped;

  return stripped.map((col) => {
    if (col.stage !== targetStage) return col;
    const buckets = col.buckets.map((b) => ({ ...b, videos: [...b.videos] }));
    moved.forEach(({ video, meta }) => {
      let bucket = buckets.find((b) => b.code === meta.code);
      if (!bucket) {
        bucket = { ...meta, videos: [] };
        buckets.push(bucket);
      }
      bucket.videos.push(video);
      bucket.count = bucket.videos.length;
    });
    return { ...col, buckets, count: buckets.reduce((a, b) => a + b.count, 0) };
  });
}

export default function KanbanBoard({ columns, children }: { columns: Columns; children?: React.ReactNode }) {
  const router = useRouter();
  const [localColumns, setLocalColumns] = useState(columns);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [justMoved, setJustMoved] = useState<Record<number, boolean>>({});
  const [syncError, setSyncError] = useState(false);
  const dragIds = useRef<number[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const selectedIds = Object.keys(selected)
    .filter((k) => selected[Number(k)])
    .map(Number);

  const toggleExpand = (code: string) => setExpanded((s) => ({ ...s, [code]: !s[code] }));
  const toggleSelect = (id: number) =>
    setSelected((s) => {
      const next = { ...s };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  const clearSelection = () => setSelected({});

  const onCardDragStart = (id: number) => () => {
    dragIds.current = selected[id] && selectedIds.length ? selectedIds : [id];
  };
  const onGroupDragStart = (ids: number[]) => () => {
    dragIds.current = ids;
  };
  const onDrop = (stage: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStage(null);
    const ids = dragIds.current;
    dragIds.current = [];
    if (!ids.length) return;

    const previousColumns = localColumns;
    setLocalColumns((cols) => moveVideos(cols, ids, stage));
    setSelected({});
    setJustMoved(Object.fromEntries(ids.map((id) => [id, true])));
    setTimeout(() => setJustMoved({}), 400);

    startTransition(async () => {
      try {
        await updateVideoStage(ids, stage);
      } catch {
        // The move didn't actually persist — roll back the optimistic UI so
        // it doesn't silently drift out of sync with the real data, then
        // force a refetch to reconcile with whatever the server has.
        setLocalColumns(previousColumns);
        setSyncError(true);
        router.refresh();
      }
    });
  };

  return (
    <div style={{ animation: "fadeup .4s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12.5, color: "#5b6470", maxWidth: 620 }}>
          Columns are post-production stages. Click a company to expand its edits. Click cards to select, then drag any selected card to move one or many to another stage at once.
        </div>
        {children}
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 11, color: "#6b7280" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#3754db" }} />
            Promo
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#0f766e" }} />
            Retainer
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#c2410c" }} />
            Repeat
          </span>
        </div>
      </div>

      {syncError && (
        <div
          className="fadeup"
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, background: "#fdecec", border: "1px solid #f6c6c6", borderRadius: 10, padding: "9px 14px" }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#8a2b2b" }}>That move didn't save — reverted and refreshed the board.</span>
          <button
            onClick={() => setSyncError(false)}
            style={{ marginLeft: "auto", background: "#fff", border: "1px solid #f0b8b8", color: "#8a2b2b", font: "500 12px 'IBM Plex Sans'", borderRadius: 7, padding: "6px 12px", cursor: "pointer" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div
          className="fadeup"
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, background: "#eef1fd", border: "1px solid #d4ddfb", borderRadius: 10, padding: "9px 14px" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#3754db">
            <circle cx="12" cy="12" r="11" />
            <path d="M17 9l-6 6-3-3" stroke="#fff" strokeWidth="2.4" fill="none" />
          </svg>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#23306e" }}>{selectedIds.length} selected</span>
          <span style={{ fontSize: 12, color: "#4a5578" }}>Drag any selected card to move them together.</span>
          <button
            onClick={clearSelection}
            style={{ marginLeft: "auto", background: "#fff", border: "1px solid #c9d3f5", color: "#3754db", font: "500 12px 'IBM Plex Sans'", borderRadius: 7, padding: "6px 12px", cursor: "pointer" }}
          >
            Clear selection
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 14 }}>
        {localColumns.map((col) => (
          <div key={col.stage} style={{ width: 286, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 10px" }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: col.fg }} />
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{col.name}</div>
              <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#9aa1aa" }}>{col.count}</div>
            </div>
            <div
              onDrop={onDrop(col.stage)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverStage !== col.stage) setDragOverStage(col.stage);
              }}
              onDragLeave={() => setDragOverStage((s) => (s === col.stage ? null : s))}
              style={{
                minHeight: 260,
                background: dragOverStage === col.stage ? "#eef1fd" : "#fafbfc",
                border: `1px dashed ${dragOverStage === col.stage ? "#3754db" : "#e1e4e8"}`,
                borderRadius: 12,
                padding: 9,
                display: "flex",
                flexDirection: "column",
                gap: 9,
                transition: "background-color 150ms ease, border-color 150ms ease",
              }}
            >
              {col.buckets.map((b) => {
                const isExpanded = expanded[b.code] ?? false;
                return (
                  <div key={b.code} className="fadeup" style={{ animationDuration: "250ms" }}>
                    <div
                      draggable
                      onClick={() => toggleExpand(b.code)}
                      onDragStart={onGroupDragStart(b.videos.map((v) => v.id))}
                      title="Click to expand · drag to move the whole group"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        background: "#fff",
                        border: "1px solid #e6e8ec",
                        borderRadius: 9,
                        cursor: "grab",
                        transition: "box-shadow 150ms ease, border-color 150ms ease",
                      }}
                    >
                      <span style={{ fontSize: 9, color: "#9aa1aa", width: 8, flexShrink: 0, transition: "transform 150ms ease", display: "inline-block", transform: isExpanded ? "none" : "rotate(-90deg)" }}>▾</span>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: b.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</span>
                      {b.monthShow && (
                        <span style={{ fontFamily: MONO, fontSize: 9, background: "#e9f6ee", color: "#15803d", borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>M{b.month}</span>
                      )}
                      {col.stage === "On Queue" ? (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontFamily: MONO,
                            fontSize: 9,
                            background: b.shootDate ? "#eef1fd" : "#f1f3f6",
                            color: b.shootDate ? "#3754db" : "#9aa1aa",
                            borderRadius: 4,
                            padding: "2px 6px",
                            flexShrink: 0,
                          }}
                        >
                          {b.shootDate ? `Shoot ${b.shootDate}` : "Not yet Booked"}
                        </span>
                      ) : (
                        b.dueDate && (
                          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9, background: "#fdf3e7", color: "#b45309", borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>Due {b.dueDate}</span>
                        )
                      )}
                      <span style={{ marginLeft: b.dueDate || col.stage === "On Queue" ? 0 : "auto", fontFamily: MONO, fontSize: 11, color: "#5b6470", background: "#f1f3f6", borderRadius: 5, padding: "1px 7px", flexShrink: 0, transition: "background-color 200ms ease" }}>
                        {b.count}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: isExpanded ? 7 : 0,
                        padding: isExpanded ? "8px 2px 2px" : "0 2px",
                        maxHeight: isExpanded ? 4000 : 0,
                        overflow: "hidden",
                        opacity: isExpanded ? 1 : 0,
                        transition: "max-height 220ms ease, opacity 180ms ease, padding 180ms ease",
                      }}
                    >
                      {b.videos.map((v) => {
                        const sel = !!selected[v.id];
                        return (
                          <div
                            key={v.id}
                            draggable
                            onClick={() => toggleSelect(v.id)}
                            onDragStart={onCardDragStart(v.id)}
                            title="Click to select · drag to move"
                            className={justMoved[v.id] ? "fadeup" : undefined}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                              background: sel ? "#eef1fd" : "#fff",
                              border: `1px solid ${sel ? "#3754db" : "#e3e6ea"}`,
                              borderLeft: `3px solid ${v.accent}`,
                              borderRadius: 9,
                              padding: "9px 10px",
                              cursor: "grab",
                              transition: "background-color 150ms ease, border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease",
                              boxShadow: justMoved[v.id] ? "0 4px 14px rgba(55,84,219,0.18)" : "none",
                            }}
                          >
                            {sel ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="#3754db" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="11" />
                                <path d="M17 9l-6 6-3-3" stroke="#fff" strokeWidth="2.4" fill="none" />
                              </svg>
                            ) : (
                              <svg width="11" height="15" viewBox="0 0 24 24" fill="#c4c9d0" style={{ flexShrink: 0 }}>
                                <circle cx="9" cy="5" r="1.7" />
                                <circle cx="15" cy="5" r="1.7" />
                                <circle cx="9" cy="12" r="1.7" />
                                <circle cx="15" cy="12" r="1.7" />
                                <circle cx="9" cy="19" r="1.7" />
                                <circle cx="15" cy="19" r="1.7" />
                              </svg>
                            )}
                            <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, color: "#1a1d21", flex: 1, minWidth: 0 }}>{v.code}</span>
                            {v.monthShow && (
                              <span style={{ fontFamily: MONO, fontSize: 9, background: "#e9f6ee", color: "#15803d", borderRadius: 4, padding: "2px 5px", flexShrink: 0 }}>M{v.month}</span>
                            )}
                            {v.irShow && (
                              <span style={{ fontFamily: MONO, fontSize: 9, background: "#f1ecfd", color: "#7c3aed", borderRadius: 4, padding: "2px 5px", flexShrink: 0 }}>IR{v.ir}</span>
                            )}
                            {v.crShow && (
                              <span style={{ fontFamily: MONO, fontSize: 9, background: "#fdf3e7", color: "#b45309", borderRadius: 4, padding: "2px 5px", flexShrink: 0 }}>CR{v.cr}</span>
                            )}
                            {col.stage === "On Queue" ? (
                              <span
                                style={{
                                  fontFamily: MONO,
                                  fontSize: 9,
                                  background: v.shootDate ? "#eef1fd" : "#f1f3f6",
                                  color: v.shootDate ? "#3754db" : "#9aa1aa",
                                  borderRadius: 4,
                                  padding: "2px 5px",
                                  flexShrink: 0,
                                }}
                              >
                                {v.shootDate ? `Shoot ${v.shootDate}` : "Not yet Booked"}
                              </span>
                            ) : (
                              v.dueDate && (
                                <span style={{ fontFamily: MONO, fontSize: 9, background: "#fdf3e7", color: "#b45309", borderRadius: 4, padding: "2px 5px", flexShrink: 0 }}>Due {v.dueDate}</span>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
