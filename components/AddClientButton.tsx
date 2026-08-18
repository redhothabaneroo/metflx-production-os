"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal, { labelStyle, inputStyle } from "./Modal";
import { createClient } from "@/lib/actions";

const blank = { type: "Retainer" as "Retainer" | "Promo" | "Repeat", business: "", contact: "", email: "", videos: "", start: "", end: "" };

export default function AddClientButton() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(blank);

  const canSave = form.business.trim() && form.contact.trim() && form.email.trim();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () => {
    if (!canSave) return;
    startTransition(async () => {
      const res = await createClient(form);
      setShow(false);
      setForm(blank);
      router.push(`/detail/${res.code}`);
    });
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          width: "100%",
          border: "none",
          background: "#1a1d21",
          color: "#fff",
          borderRadius: 9,
          padding: 10,
          cursor: "pointer",
          font: "600 12.5px 'IBM Plex Sans'",
          marginBottom: 12,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add a new client
      </button>

      {show && (
        <Modal onClose={() => setShow(false)} maxWidth={520}>
          <div style={{ display: "flex", alignItems: "center", padding: "20px 22px", borderBottom: "1px solid #eef0f3" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em" }}>Add a new client</div>
              <div style={{ fontSize: 12, color: "#8a9099", marginTop: 2 }}>Create the client folder and onboarding record</div>
            </div>
            <button onClick={() => setShow(false)} style={{ marginLeft: "auto", width: 30, height: 30, border: "none", background: "#f1f3f6", borderRadius: 8, cursor: "pointer", color: "#6b7280", fontSize: 16, lineHeight: 1 }}>
              ✕
            </button>
          </div>

          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={labelStyle}>Client type</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setForm((f) => ({ ...f, type: "Retainer" }))}
                  style={{ flex: 1, border: "1px solid #e3e6ea", borderRadius: 9, padding: 10, cursor: "pointer", font: "600 12.5px 'IBM Plex Sans'", background: form.type === "Retainer" ? "#0f766e" : "#fff", color: form.type === "Retainer" ? "#fff" : "#5b6470" }}
                >
                  Retainer
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, type: "Repeat" }))}
                  style={{ flex: 1, border: "1px solid #e3e6ea", borderRadius: 9, padding: 10, cursor: "pointer", font: "600 12.5px 'IBM Plex Sans'", background: form.type === "Repeat" ? "#c2410c" : "#fff", color: form.type === "Repeat" ? "#fff" : "#5b6470" }}
                >
                  Repeat
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, type: "Promo" }))}
                  style={{ flex: 1, border: "1px solid #e3e6ea", borderRadius: 9, padding: 10, cursor: "pointer", font: "600 12.5px 'IBM Plex Sans'", background: form.type === "Promo" ? "#3754db" : "#fff", color: form.type === "Promo" ? "#fff" : "#5b6470" }}
                >
                  Promo
                </button>
              </div>
              {form.type === "Repeat" && (
                <div style={{ fontSize: 11.5, color: "#9aa1aa", marginTop: 6 }}>Month-to-month — same production cycle as a retainer, no lock-in contract.</div>
              )}
            </div>

            <div>
              <div style={labelStyle}>Business name</div>
              <input value={form.business} onChange={set("business")} placeholder="e.g. Lumen Fitness" style={inputStyle} />
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={labelStyle}>Contact name</div>
                <input value={form.contact} onChange={set("contact")} placeholder="e.g. Jordan Webb" style={inputStyle} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={labelStyle}>Email address</div>
                <input value={form.email} onChange={set("email")} placeholder="name@business.com" style={inputStyle} />
              </div>
            </div>

            <div>
              <div style={labelStyle}>Videos per month</div>
              <input type="number" min={1} max={30} value={form.videos} onChange={set("videos")} placeholder="e.g. 8" style={inputStyle} />
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={labelStyle}>Contract start date</div>
                <input type="date" value={form.start} onChange={set("start")} style={inputStyle} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={labelStyle}>{form.type === "Promo" ? "Delivery date" : form.type === "Repeat" ? "End date (optional)" : "Contract end date"}</div>
                <input type="date" value={form.end} onChange={set("end")} style={inputStyle} />
              </div>
            </div>
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
              Create client
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
