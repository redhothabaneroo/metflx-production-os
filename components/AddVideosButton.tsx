"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal, { labelStyle, inputStyle } from "./Modal";
import Toast from "./Toast";
import { addVideos } from "@/lib/actions";
import { PROMO_STAGE_OPTIONS, RETAINER_STAGE_OPTIONS } from "@/lib/business";

type ClientOption = { code: string; name: string; type: "Retainer" | "Promo"; label: string };

export default function AddVideosButton({ clientOptions }: { clientOptions: ClientOption[] }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();
  const [client, setClient] = useState("");
  const [count, setCount] = useState("");
  const [month, setMonth] = useState("1");
  const [stage, setStage] = useState("");
  const [toast, setToast] = useState<{ message: string; code: string } | null>(null);

  const selected = clientOptions.find((c) => c.code === client);
  const isRetainer = selected?.type === "Retainer";
  const stageOptions = isRetainer ? RETAINER_STAGE_OPTIONS : PROMO_STAGE_OPTIONS;
  const countNum = Math.max(0, Math.min(30, parseInt(count, 10) || 0));
  const canSave = !!selected && countNum > 0 && !!stage;

  const open = () => {
    setClient("");
    setCount("");
    setStage("");
    setMonth("1");
    setShow(true);
  };

  const onClientChange = (code: string) => {
    setClient(code);
    const cl = clientOptions.find((c) => c.code === code);
    const opts = cl?.type === "Retainer" ? RETAINER_STAGE_OPTIONS : PROMO_STAGE_OPTIONS;
    setStage(opts[0]);
  };

  const save = () => {
    if (!canSave || !selected) return;
    startTransition(async () => {
      const res = await addVideos({ clientCode: selected.code, count: String(countNum), stage, month });
      setShow(false);
      setToast({ message: res.message, code: selected.code });
      setTimeout(() => setToast(null), 5000);
    });
  };

  return (
    <>
      <button
        onClick={open}
        style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: "#1a1d21", color: "#fff", borderRadius: 8, padding: "9px 14px", cursor: "pointer", font: "600 12.5px 'IBM Plex Sans'" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add Videos
      </button>

      {show && (
        <Modal onClose={() => setShow(false)}>
          <div style={{ display: "flex", alignItems: "center", padding: "20px 22px", borderBottom: "1px solid #eef0f3" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em" }}>Add Videos</div>
              <div style={{ fontSize: 12, color: "#8a9099", marginTop: 2 }}>Create deliverable cards for a client</div>
            </div>
            <button onClick={() => setShow(false)} style={{ marginLeft: "auto", width: 30, height: 30, border: "none", background: "#f1f3f6", borderRadius: 8, cursor: "pointer", color: "#6b7280", fontSize: 16, lineHeight: 1 }}>
              ✕
            </button>
          </div>

          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={labelStyle}>Client</div>
              <select value={client} onChange={(e) => onClientChange(e.target.value)} style={{ ...inputStyle, background: "#fff", font: "500 13px 'IBM Plex Sans'" }}>
                <option value="">Select a client…</option>
                {clientOptions.map((co) => (
                  <option key={co.code} value={co.code}>
                    {co.label}
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10.5,
                    background: isRetainer ? "#e9f6ee" : "#eef1fd",
                    color: isRetainer ? "#15803d" : "#3754db",
                    borderRadius: 6,
                    padding: "6px 10px",
                    width: "fit-content",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  {isRetainer ? "Retainer · monthly deliverable" : "Promo · one-off deliverable"}
                </div>

                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={labelStyle}>Number of videos</div>
                    <input type="number" min={1} max={30} value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 5" style={inputStyle} />
                  </div>
                  {isRetainer && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={labelStyle}>Month</div>
                      <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...inputStyle, background: "#fff", font: "500 13px 'IBM Plex Sans'" }}>
                        {[1, 2, 3, 4, 5, 6].map((m) => (
                          <option key={m} value={m}>
                            Month {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <div style={labelStyle}>Stage</div>
                  <select value={stage} onChange={(e) => setStage(e.target.value)} style={{ ...inputStyle, background: "#fff", font: "500 13px 'IBM Plex Sans'" }}>
                    {stageOptions.map((so) => (
                      <option key={so} value={so}>
                        {so}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderTop: "1px solid #eef0f3", background: "#fafbfc", borderRadius: "0 0 16px 16px" }}>
            <button
              onClick={() => setShow(false)}
              style={{ marginLeft: "auto", border: "1px solid #dde1e6", background: "#fff", color: "#5b6470", borderRadius: 9, padding: "10px 18px", cursor: "pointer", font: "600 12.5px 'IBM Plex Sans'" }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!canSave || pending}
              style={{ border: "none", background: canSave ? "#1a1d21" : "#c4c9d0", color: "#fff", borderRadius: 9, padding: "10px 20px", cursor: canSave ? "pointer" : "not-allowed", font: "600 12.5px 'IBM Plex Sans'" }}
            >
              Add videos
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <Toast
          message={toast.message}
          onView={() => {
            router.push(`/detail/${toast.code}`);
            setToast(null);
          }}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
