"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal, { labelStyle, inputStyle } from "./Modal";
import { createCustomTask } from "@/lib/actions";

type ClientOption = { code: string; name: string; type: "Retainer" | "Promo" | "Repeat"; label: string };

export default function AddTaskButton({ clientOptions, member }: { clientOptions: ClientOption[]; member: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();
  const [client, setClient] = useState("");
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState("");

  const canSave = !!client && label.trim().length > 0;

  const open = () => {
    setClient("");
    setLabel("");
    setDueDate("");
    setShow(true);
  };

  const save = () => {
    if (!canSave) return;
    startTransition(async () => {
      await createCustomTask({ clientCode: client, label, owner: member, dueDate });
      setShow(false);
      router.refresh();
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
        Add task
      </button>

      {show && (
        <Modal onClose={() => setShow(false)}>
          <div style={{ display: "flex", alignItems: "center", padding: "20px 22px", borderBottom: "1px solid #eef0f3" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em" }}>Add task</div>
              <div style={{ fontSize: 12, color: "#8a9099", marginTop: 2 }}>Create a custom task for {member}</div>
            </div>
            <button onClick={() => setShow(false)} style={{ marginLeft: "auto", width: 30, height: 30, border: "none", background: "#f1f3f6", borderRadius: 8, cursor: "pointer", color: "#6b7280", fontSize: 16, lineHeight: 1 }}>
              ✕
            </button>
          </div>

          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={labelStyle}>Client</div>
              <select value={client} onChange={(e) => setClient(e.target.value)} style={{ ...inputStyle, background: "#fff", font: "500 13px 'IBM Plex Sans'" }}>
                <option value="">Select a client…</option>
                {clientOptions.map((co) => (
                  <option key={co.code} value={co.code}>
                    {co.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={labelStyle}>Task name</div>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Follow up on brand assets" style={inputStyle} />
            </div>

            <div>
              <div style={labelStyle}>Due date</div>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
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
              Add task
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
