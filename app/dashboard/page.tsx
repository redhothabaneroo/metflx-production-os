import Link from "next/link";
import { listDashboardClients, listUpcoming, listActiveEditsCount, listShootsThisWeekCount } from "@/lib/data";
import { PageHeader } from "@/components/PageHeaderContext";

export const dynamic = "force-dynamic";

const MONO = "'IBM Plex Mono', monospace";

function ClientRow({ c, gridCols }: { c: Awaited<ReturnType<typeof listDashboardClients>>["retainers"][number]; gridCols: string }) {
  return (
    <Link href={`/detail/${c.code}`} className="hover-row" style={{ display: "block", borderTop: "1px solid #f1f3f6", padding: "13px 18px", cursor: "pointer", textDecoration: "none", color: "inherit" }}>
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 14, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: c.typeBg, color: c.typeFg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
            {c.code}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".07em", textTransform: "uppercase", color: c.typeFg, marginTop: 1 }}>{c.type}</div>
          </div>
        </div>
        {c.month && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 600 }}>{c.monthLabel}</div>
            <div style={{ height: 4, background: "#eef0f3", borderRadius: 3, marginTop: 5, overflow: "hidden", maxWidth: 70 }}>
              <div style={{ height: "100%", width: c.monthPct, background: "#0f766e", borderRadius: 3 }} />
            </div>
          </div>
        )}
        <div>
          <span style={{ fontSize: 11.5, fontWeight: 500, padding: "4px 10px", borderRadius: 6, background: c.stageBg, color: c.stageFg, whiteSpace: "nowrap" }}>{c.stage}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          {c.hasEdits ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{c.total}</span>
                <span style={{ fontSize: 11, color: "#8a9099" }}>videos</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 11px" }}>
                {c.dist.map((d) => (
                  <span key={d.stage} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#5b6470" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    {d.count} {d.short}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <span style={{ fontSize: 12, color: "#9aa1aa" }}>No edits yet</span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, lineHeight: 1.3 }}>{c.next}</div>
          <div style={{ fontFamily: MONO, fontSize: 10, marginTop: 3, color: "#9aa1aa" }}>{c.nextDate}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, padding: "4px 9px", borderRadius: 6, background: c.statusBg, color: c.statusFg, whiteSpace: "nowrap" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.statusDot }} />
            {c.statusLabel}
          </span>
          <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4c9d0" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginTop: 9, paddingLeft: 43 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b6bcc4" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <span style={{ fontSize: 11.5, color: "#7b828c", lineHeight: 1.4 }}>{c.note}</span>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const [{ retainers, promos }, upcoming, activeEdits, shootsThisWeek] = await Promise.all([
    listDashboardClients(),
    listUpcoming(),
    listActiveEditsCount(),
    listShootsThisWeekCount(),
  ]);

  const retainerCols = "minmax(0,1.7fr) minmax(0,0.85fr) minmax(0,1fr) minmax(0,1.55fr) minmax(0,1.4fr) minmax(0,0.95fr)";
  const promoCols = "minmax(0,1.85fr) minmax(0,1.6fr) minmax(0,1.5fr) minmax(0,0.95fr)";

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto" }} className="fadeup">
      <PageHeader title="Dashboard" subtitle={`Tuesday, June 24 · ${activeEdits} active edits, ${shootsThisWeek} shoots this week`} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 318px", gap: 18, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: "4px 0 6px" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "16px 18px 12px" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#0f766e", marginRight: 9 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Retainers</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#8a9099", marginLeft: 8, textTransform: "uppercase", letterSpacing: ".07em" }}>
                {retainers.length} active
              </div>
              <Link href="/clients" style={{ marginLeft: "auto", color: "#3754db", font: "500 12px 'IBM Plex Sans'", textDecoration: "none" }}>
                Pipeline view →
              </Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 680 }}>
                <div style={{ display: "grid", gridTemplateColumns: retainerCols, gap: 14, padding: "0 18px 9px" }}>
                  {["Client", "Month", "Stage", "Video edits", "What's next", "Status"].map((h) => (
                    <div key={h} style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#9aa1aa" }}>
                      {h}
                    </div>
                  ))}
                </div>
                {retainers.map((c) => (
                  <ClientRow key={c.code} c={c} gridCols={retainerCols} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: "4px 0 6px" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "16px 18px 12px" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#3754db", marginRight: 9 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Promo</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#8a9099", marginLeft: 8, textTransform: "uppercase", letterSpacing: ".07em" }}>
                {promos.length} active
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 640 }}>
                <div style={{ display: "grid", gridTemplateColumns: promoCols, gap: 14, padding: "0 18px 9px" }}>
                  {["Client", "Stage", "Video edits", "What's next", "Status"].map((h) => (
                    <div key={h} style={{ fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#9aa1aa" }}>
                      {h}
                    </div>
                  ))}
                </div>
                {promos.map((c) => (
                  <ClientRow key={c.code} c={c} gridCols={promoCols} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: "18px 16px 8px", position: "sticky", top: 0 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14, padding: "0 2px" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Upcoming</div>
            <Link href="/schedule" style={{ marginLeft: "auto", color: "#3754db", font: "500 12px 'IBM Plex Sans'", textDecoration: "none" }}>
              Schedule →
            </Link>
          </div>
          <div style={{ display: "flex", gap: 14, marginBottom: 14, padding: "0 2px", fontSize: 10.5, color: "#6b7280" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#3754db" }} />
              Shoot
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#7c3aed" }} />
              Meeting
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#d97706" }} />
              Deadline
            </span>
          </div>
          {upcoming.length === 0 && <div style={{ fontSize: 12, color: "#9aa1aa", padding: "0 2px 12px" }}>Nothing scheduled yet.</div>}
          {upcoming.map((u, i) => (
            <Link key={i} href={`/detail/${u.code}`} className="hover-row" style={{ display: "flex", gap: 11, padding: "10px 2px", borderTop: "1px solid #f1f3f6", cursor: "pointer", textDecoration: "none", color: "inherit" }}>
              <div style={{ textAlign: "center", width: 34, flexShrink: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", color: "#9aa1aa", letterSpacing: ".05em" }}>{u.day}</div>
                <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>{u.dnum}</div>
              </div>
              <div style={{ width: 3, borderRadius: 2, background: u.accent, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.title}</span>
                  <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: ".05em", textTransform: "uppercase", padding: "2px 5px", borderRadius: 4, background: u.bg, color: u.accent, flexShrink: 0 }}>
                    {u.kindLabel}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#8a9099", marginTop: 2 }}>{u.sub}</div>
              </div>
            </Link>
          ))}
          <div style={{ height: 6 }} />
        </aside>
      </div>
    </div>
  );
}
