"use client";

import { useState, useTransition } from "react";
import { updateClientInfo, updateShootDate } from "@/lib/actions";
import type { getClientDetail } from "@/lib/data";

const MONO = "'IBM Plex Mono', monospace";
const fieldStyle: React.CSSProperties = { border: "1px solid #dde1e6", borderRadius: 7, padding: "6px 9px", background: "#fff", width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: ".08em", color: "#9aa1aa", marginBottom: 3 };

type Detail = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>;

export default function ClientInfoCard({ code, detail }: { code: string; detail: Detail }) {
  const [, startTransition] = useTransition();
  const [contact, setContact] = useState(detail.info.contact === "—" ? "" : detail.info.contact);
  const [email, setEmail] = useState(detail.info.email === "—" ? "" : detail.info.email);
  const [plan, setPlan] = useState(detail.info.plan === "—" ? "" : detail.info.plan);
  const [start, setStart] = useState(detail.info.start === "—" ? "" : detail.info.start);
  const [end, setEnd] = useState(detail.info.end === "—" || detail.info.end === "One-time delivery" ? "" : detail.info.end);
  const [shootDate, setShootDate] = useState(detail.shootDate);

  return (
    <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 15 }}>Client</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div>
          <div style={labelStyle}>Business</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{detail.name}</div>
            <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: detail.typeBg, color: detail.typeFg }}>{detail.type}</span>
          </div>
        </div>
        {detail.isPromo && (
          <div>
            <div style={labelStyle}>Shoot date</div>
            <input
              type="date"
              value={shootDate}
              onChange={(e) => {
                setShootDate(e.target.value);
                startTransition(() => updateShootDate(code, "main", e.target.value));
              }}
              style={{ ...fieldStyle, font: "600 12.5px 'IBM Plex Sans'", color: shootDate ? "#1a1d21" : "#9aa1aa" }}
            />
          </div>
        )}
        <div>
          <div style={labelStyle}>Contact</div>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            onBlur={() => startTransition(() => updateClientInfo(code, { contact }))}
            style={{ ...fieldStyle, font: "600 13px 'IBM Plex Sans'", color: "#1a1d21" }}
          />
        </div>
        <div>
          <div style={labelStyle}>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => startTransition(() => updateClientInfo(code, { email }))}
            style={{ ...fieldStyle, font: "500 12.5px 'IBM Plex Sans'", color: "#3754db" }}
          />
        </div>
        <div style={{ height: 1, background: "#eef0f3", margin: "1px 0" }} />
        <div>
          <div style={labelStyle}>Contract</div>
          <input
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            onBlur={() => startTransition(() => updateClientInfo(code, { plan }))}
            style={{ ...fieldStyle, font: "600 13px 'IBM Plex Sans'", color: "#1a1d21" }}
          />
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Started</div>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              onBlur={() => startTransition(() => updateClientInfo(code, { contractStart: start }))}
              style={{ ...fieldStyle, font: "500 12.5px 'IBM Plex Sans'", color: "#1a1d21" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>{detail.info.endLabel}</div>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              onBlur={() => startTransition(() => updateClientInfo(code, { contractEnd: end }))}
              style={{ ...fieldStyle, font: "500 12.5px 'IBM Plex Sans'", color: "#1a1d21" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
