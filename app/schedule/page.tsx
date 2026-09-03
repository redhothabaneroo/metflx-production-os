import Link from "next/link";
import { listCalendar, type CalendarView } from "@/lib/data";
import { PageHeader } from "@/components/PageHeaderContext";

export const dynamic = "force-dynamic";

const MONO = "'IBM Plex Mono', monospace";

function ViewLink({ view, anchor, active, children }: { view: CalendarView; anchor: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={`/schedule?view=${view}&date=${anchor}`}
      style={{
        fontFamily: MONO,
        fontSize: 11,
        borderRadius: 6,
        padding: "6px 11px",
        textDecoration: "none",
        background: active ? "#1a1d21" : "transparent",
        color: active ? "#fff" : "#6b7280",
        border: active ? "none" : "1px solid #dde1e6",
      }}
    >
      {children}
    </Link>
  );
}

function NavArrow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 7,
        border: "1px solid #dde1e6",
        color: "#5b6470",
        textDecoration: "none",
        fontSize: 13,
        background: "#fff",
      }}
    >
      {children}
    </Link>
  );
}

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ view?: string; date?: string }> }) {
  const sp = await searchParams;
  const view: CalendarView = sp.view === "week" ? "week" : "month";
  const result = await listCalendar(view, sp.date);
  const { needsBooking, crewLoad, prevAnchor, nextAnchor, todayAnchor } = result;

  return (
    <div style={{ animation: "fadeup .4s ease-out" }}>
      <PageHeader title="Calendar" subtitle="Bookings, meetings & deadlines" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <NavArrow href={`/schedule?view=${view}&date=${prevAnchor}`}>‹</NavArrow>
        <NavArrow href={`/schedule?view=${view}&date=${nextAnchor}`}>›</NavArrow>
        <Link
          href={`/schedule?view=${view}&date=${todayAnchor}`}
          style={{ fontFamily: MONO, fontSize: 11, borderRadius: 6, padding: "6px 11px", border: "1px solid #dde1e6", color: "#5b6470", textDecoration: "none" }}
        >
          Today
        </Link>
        <div style={{ fontSize: 14, fontWeight: 600, marginLeft: 4 }}>{result.label}</div>

        <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
          <ViewLink view="month" anchor={sp.date || todayAnchor} active={view === "month"}>
            Month
          </ViewLink>
          <ViewLink view="week" anchor={sp.date || todayAnchor} active={view === "week"}>
            Week
          </ViewLink>
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
          {result.view === "week" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
              {result.week.map((d) => (
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
          )}

          {result.view === "month" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #eef0f3" }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dow) => (
                  <div key={dow} style={{ padding: "9px 10px", fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".07em", color: "#8a9099", textAlign: "center" }}>
                    {dow}
                  </div>
                ))}
              </div>
              {result.weeks.map((wk, wi) => (
                <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: wi < result.weeks.length - 1 ? "1px solid #eef0f3" : "none" }}>
                  {wk.map((d) => (
                    <div
                      key={d.date}
                      style={{
                        borderRight: "1px solid #eef0f3",
                        minHeight: 108,
                        padding: "7px 7px",
                        background: d.isToday ? "#fbfcff" : "#fff",
                        opacity: d.inMonth ? 1 : 0.45,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: d.isToday ? "#3754db" : "#1a1d21", marginBottom: 5 }}>{d.dnum}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {d.events.map((ev, i) => (
                          <div key={i} style={{ background: ev.bg, borderLeft: `2px solid ${ev.accent}`, borderRadius: 4, padding: "2px 5px", fontSize: 10, color: ev.fg, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {ev.title}
                          </div>
                        ))}
                        {d.moreCount > 0 && <div style={{ fontSize: 9.5, color: "#9aa1aa", fontFamily: MONO, padding: "0 5px" }}>+{d.moreCount} more</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
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
