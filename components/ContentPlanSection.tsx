"use client";

import { useState, useTransition } from "react";
import { parseContentPlanText, saveContentPlan, toggleShot, deleteConcept } from "@/lib/actions";
import type { ParsedConcept } from "@/lib/anthropic";
import type { getClientDetail } from "@/lib/data";

const MONO = "'IBM Plex Mono', monospace";

type Detail = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>;
type ConceptView = Detail["contentPlan"][number];

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${active ? "#3754db" : "#dde1e6"}`,
        background: active ? "#eef1fd" : "#fff",
        color: active ? "#3754db" : "#5b6470",
        borderRadius: 7,
        padding: "5px 11px",
        cursor: "pointer",
        font: "600 11.5px 'IBM Plex Sans'",
      }}
    >
      {children}
    </button>
  );
}

function ConceptHeader({ c }: { c: ConceptView }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
      <div>
        {c.code && (
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, color: "#fff", background: "#1a1d21", padding: "2px 7px", borderRadius: 4, marginRight: 8 }}>{c.code}</span>
        )}
        <span style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</span>
      </div>
    </div>
  );
}

function ReferenceLine({ reference }: { reference: string }) {
  if (!reference) return null;
  const url = reference.match(/https?:\/\/\S+/)?.[0];
  return (
    <p style={{ fontSize: 11.5, color: "#8a9099", margin: "4px 0 0" }}>
      Reference —{" "}
      {url ? (
        <a href={url} target="_blank" rel="noopener" style={{ color: "#3754db" }}>
          {reference}
        </a>
      ) : (
        reference
      )}
    </p>
  );
}

function ClientTab({ concepts }: { concepts: ConceptView[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {concepts.map((c) => (
        <div key={c.id} style={{ borderTop: "1px solid #eef0f3", paddingTop: 14 }}>
          <ConceptHeader c={c} />
          {c.concept && <p style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 6px" }}>{c.concept}</p>}
          {c.focus && (
            <p style={{ fontSize: 12, color: "#5b6470", margin: 0 }}>
              <strong>Focus — </strong>
              {c.focus}
            </p>
          )}
          <ReferenceLine reference={c.reference} />
          {c.notes.length > 0 && (
            <ul style={{ fontSize: 12, color: "#5b6470", background: "#fafbfc", border: "1px solid #eef0f3", borderRadius: 7, padding: "8px 10px 8px 24px", margin: "8px 0 0", lineHeight: 1.6 }}>
              {c.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ProductionTab({ concepts }: { concepts: ConceptView[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {concepts.map((c) => (
        <div key={c.id} style={{ borderTop: "1px solid #eef0f3", paddingTop: 14 }}>
          <ConceptHeader c={c} />
          {c.talent && (
            <p style={{ fontSize: 12, color: "#5b6470", margin: "0 0 4px" }}>
              <strong>Talent — </strong>
              {c.talent}
            </p>
          )}
          <ReferenceLine reference={c.reference} />
          {c.questions.length > 0 && (
            <>
              <div style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".06em", color: "#9aa1aa", margin: "10px 0 4px" }}>Questions</div>
              <ol style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
                {c.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </>
          )}
          <div style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".06em", color: "#9aa1aa", margin: "10px 0 4px" }}>Shot list</div>
          {c.shots.length ? (
            <ol style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
              {c.shots.map((s) => (
                <li key={s.id}>{s.text}</li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: 12, color: "#9aa1aa", margin: 0 }}>N/A</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ChecklistTab({ concepts }: { concepts: ConceptView[] }) {
  const [, startTransition] = useTransition();
  const active = concepts.filter((c) => !c.wrapped);
  const wrapped = concepts.filter((c) => c.wrapped);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {active.map((c) => {
        const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
        return (
          <div key={c.id} style={{ borderTop: "1px solid #eef0f3", paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <ConceptHeader c={c} />
              </div>
              <button
                onClick={() => startTransition(() => deleteConcept(c.id))}
                title="Delete concept"
                style={{ border: "none", background: "none", color: "#9aa1aa", cursor: "pointer", fontSize: 15, padding: "2px 4px", flexShrink: 0 }}
              >
                ✕
              </button>
            </div>
            {c.total > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
                <div style={{ flex: 1, height: 5, background: "#eef0f3", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#3754db", borderRadius: 3, transition: "width 0.3s ease" }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#8a9099", whiteSpace: "nowrap" }}>
                  {c.done}/{c.total}
                </span>
              </div>
            )}
            {c.shots.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 2px", borderTop: "1px solid #f4f5f7", fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={s.checked}
                  onChange={(e) => startTransition(() => toggleShot(s.id, e.target.checked))}
                  style={{ width: 16, height: 16, flexShrink: 0, accentColor: "#3754db" }}
                />
                <span style={{ color: s.checked ? "#a19a87" : "#1a1d21", textDecoration: s.checked ? "line-through" : "none" }}>{s.text}</span>
              </label>
            ))}
          </div>
        );
      })}
      {active.length === 0 && <div style={{ padding: "20px 8px", textAlign: "center", color: "#9aa1aa", fontSize: 12.5 }}>No active concepts — import a content plan above.</div>}
      {wrapped.length > 0 && (
        <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 10 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".06em", color: "#9aa1aa", marginBottom: 6 }}>Shot ({wrapped.length})</div>
          {wrapped.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 2px", fontSize: 12.5 }}>
              {c.code && <span style={{ fontFamily: MONO, fontSize: 10, color: "#8a9099" }}>{c.code}</span>}
              <span style={{ color: "#5b6470", flex: 1 }}>{c.title}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: "#e9f6ee", color: "#15803d" }}>Complete</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ContentPlanSection({
  clientCode,
  scopeKey,
  concepts,
  bare = false,
}: {
  clientCode: string;
  scopeKey: string;
  concepts: ConceptView[];
  bare?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"client" | "production" | "checklist">("checklist");
  const [importOpen, setImportOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [preview, setPreview] = useState<ParsedConcept[] | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const totalShots = concepts.reduce((a, c) => a + c.total, 0);
  const doneShots = concepts.reduce((a, c) => a + c.done, 0);

  const parse = () => {
    setError("");
    startTransition(async () => {
      try {
        const result = await parseContentPlanText(rawText);
        setPreview(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't parse that text.");
      }
    });
  };

  const save = () => {
    if (!preview) return;
    startTransition(async () => {
      await saveContentPlan(clientCode, scopeKey, preview);
      setPreview(null);
      setRawText("");
      setImportOpen(false);
    });
  };

  return (
    <div style={bare ? {} : { background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: open ? 14 : 0 }}>
        <div onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", cursor: "pointer", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: "#9aa1aa", width: 14 }}>{open ? "▾" : "▸"}</span>
          <div style={{ fontSize: bare ? 13 : 14, fontWeight: 600 }}>Content plan</div>
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#8a9099" }}>
            {concepts.length} concept{concepts.length === 1 ? "" : "s"} · {doneShots}/{totalShots} shots
          </span>
        </div>
      </div>

      {open && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <TabButton active={tab === "client"} onClick={() => setTab("client")}>
              Client
            </TabButton>
            <TabButton active={tab === "production"} onClick={() => setTab("production")}>
              Production
            </TabButton>
            <TabButton active={tab === "checklist"} onClick={() => setTab("checklist")}>
              Shot checklist
            </TabButton>
            <button
              onClick={() => setImportOpen((s) => !s)}
              style={{ marginLeft: "auto", border: "none", background: "#1a1d21", color: "#fff", borderRadius: 7, padding: "5px 11px", cursor: "pointer", font: "600 11.5px 'IBM Plex Sans'" }}
            >
              + Import from doc
            </button>
          </div>

          {importOpen && (
            <div style={{ background: "#fafbfc", border: "1px solid #eef0f3", borderRadius: 9, padding: 14, marginBottom: 16 }}>
              {!preview ? (
                <>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#9aa1aa", marginBottom: 6 }}>
                    Paste the content plan doc text
                  </div>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the whole content plan (client or production version) here..."
                    style={{ width: "100%", minHeight: 140, border: "1px solid #dde1e6", borderRadius: 7, padding: 10, font: "13px 'IBM Plex Sans'", resize: "vertical", boxSizing: "border-box" }}
                  />
                  {error && <div style={{ color: "#c2353a", fontSize: 12, marginTop: 8 }}>{error}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      onClick={parse}
                      disabled={pending || !rawText.trim()}
                      style={{ border: "none", background: "#1a1d21", color: "#fff", borderRadius: 7, padding: "8px 14px", cursor: pending ? "default" : "pointer", font: "600 12px 'IBM Plex Sans'", opacity: pending ? 0.6 : 1 }}
                    >
                      {pending ? "Parsing…" : "Parse"}
                    </button>
                    <button
                      onClick={() => {
                        setImportOpen(false);
                        setRawText("");
                        setError("");
                      }}
                      style={{ border: "1px solid #dde1e6", background: "#fff", color: "#5b6470", borderRadius: 7, padding: "8px 14px", cursor: "pointer", font: "600 12px 'IBM Plex Sans'" }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#9aa1aa", marginBottom: 8 }}>
                    Found {preview.length} concept{preview.length === 1 ? "" : "s"} — review before saving
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                    {preview.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, padding: "4px 0" }}>
                        {c.code && <span style={{ fontFamily: MONO, fontWeight: 700, color: "#3754db" }}>{c.code}</span>}
                        <span style={{ flex: 1 }}>{c.title}</span>
                        <span style={{ fontFamily: MONO, fontSize: 11, color: "#8a9099" }}>{c.shots.length} shots</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={save}
                      disabled={pending}
                      style={{ border: "none", background: "#1a1d21", color: "#fff", borderRadius: 7, padding: "8px 14px", cursor: pending ? "default" : "pointer", font: "600 12px 'IBM Plex Sans'", opacity: pending ? 0.6 : 1 }}
                    >
                      {pending ? "Saving…" : `Save ${preview.length} concept${preview.length === 1 ? "" : "s"}`}
                    </button>
                    <button
                      onClick={() => setPreview(null)}
                      style={{ border: "1px solid #dde1e6", background: "#fff", color: "#5b6470", borderRadius: 7, padding: "8px 14px", cursor: "pointer", font: "600 12px 'IBM Plex Sans'" }}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {concepts.length === 0 && !importOpen ? (
            <div style={{ padding: "20px 8px", textAlign: "center", color: "#9aa1aa", fontSize: 12.5 }}>No content plan imported yet for this {scopeKey === "main" ? "project" : "month"}.</div>
          ) : (
            <>
              {tab === "client" && <ClientTab concepts={concepts} />}
              {tab === "production" && <ProductionTab concepts={concepts} />}
              {tab === "checklist" && <ChecklistTab concepts={concepts} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
