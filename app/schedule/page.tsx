import { listSchedule } from "@/lib/data";
import { PageHeader } from "@/components/PageHeaderContext";

export const dynamic = "force-dynamic";

const MONO = "'IBM Plex Mono', monospace";

export default async function SchedulePage() {
  const { week, needsBooking, crewLoad, weekLabel } = await listSchedule();

  return (
    <div style={{ animation: "fadeup .4s ease-out" }}>
      <PageHeader title="Shoot Schedule" subtitle="Bookings, meetings & deadlines" />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{weekLabel}</div>
        </div>
        <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, background: "#1a1d21", color: "#fff", borderRadius: 6, padding: "6px 11px" }}>Week</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 11, color: "#6b7280" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#3754db" }} />
            Shoot
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#7c3aed" }} />
            Meeting
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#d97706" }} />
            Deadline
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {week.map((d) => (
              <div key={d.dow} style={{ borderRight: "1px solid #eef0f3", minHeight: 340, background: d.colBg }}>
                <div style={{ padding: "11px 10px", borderBottom: "1px solid #eef0f3", textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".07em", color: "#8a9099" }}>{d.dow}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, color: d.numColor }}>{d.dnum}</div>
                </div>
                <div style={{ padding: "8px 7px", display: "flex", flexDirection: "column", gap: 7 }}>
                  {d.events.map((ev, i) => (
                    <div key={i} style={{ background: ev.bg, borderLeft: `3px solid ${ev.accent}`, borderRadius: 6, padding: "7px 8px" }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: ev.fg, lineHeight: 1.2 }}>{ev.title}</div>
                      <div style={{ fontSize: 10, color: "#7b828c", marginTop: 2 }}>{ev.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 13 }}>Needs booking</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {needsBooking.length === 0 && <div style={{ fontSize: 12, color: "#9aa1aa" }}>All caught up.</div>}
              {needsBooking.map((b, i) => (
                <div key={i} style={{ border: "1px dashed #d3d7dd", borderRadius: 9, padding: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{b.client}</span>
                    <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: ".05em", padding: "2px 6px", borderRadius: 4, background: b.kbg, color: b.kfg }}>{b.kind}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#8a9099", marginBottom: 8 }}>{b.note}</div>
                  <button style={{ width: "100%", background: "#1a1d21", color: "#fff", border: "none", borderRadius: 7, padding: 7, font: "500 11.5px 'IBM Plex Sans'", cursor: "pointer" }}>{b.cta}</button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 11 }}>Crew this week</div>
            {crewLoad.length === 0 && <div style={{ fontSize: 12, color: "#9aa1aa" }}>No shoots booked yet.</div>}
            {crewLoad.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: c.bg, color: c.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600 }}>
                  {c.initials}
                </div>
                <span style={{ fontSize: 12.5 }}>{c.name}</span>
                <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: "#6b7280" }}>{c.count} shoots</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
