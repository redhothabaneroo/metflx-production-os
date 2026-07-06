import Link from "next/link";
import { listLifecycleLanes } from "@/lib/data";
import { PageHeader } from "@/components/PageHeaderContext";

export const dynamic = "force-dynamic";

const MONO = "'IBM Plex Mono', monospace";

export default async function ClientsPage() {
  const lanes = await listLifecycleLanes();

  return (
    <div style={{ animation: "fadeup .4s ease-out" }}>
      <PageHeader title="Client Pipeline" subtitle="Lifecycle from onboarding to live" />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#8a9099" }}>
          Full client lifecycle, lead → live. Promo clients run the full path; retainers loop monthly from Content Plan.
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 11, color: "#6b7280" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#3754db" }} />
            Promo
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#0f766e" }} />
            Retainer
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 13, overflowX: "auto", paddingBottom: 14 }}>
        {lanes.map((col) => (
          <div key={col.name} style={{ width: 230, flexShrink: 0 }}>
            <div style={{ background: "#e7eaef", borderRadius: 9, padding: "9px 12px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{col.name}</div>
                <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10.5, color: "#7b828c" }}>{col.count}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {col.items.map((c) => (
                <Link
                  key={c.code}
                  href={`/detail/${c.code}`}
                  style={{ display: "block", background: "#fff", border: "1px solid #e3e6ea", borderRadius: 10, padding: 12, cursor: "pointer", textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.typeFg }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{c.client}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#7b828c", lineHeight: 1.35, marginBottom: 9 }}>{c.note}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 19, height: 19, borderRadius: "50%", background: c.ownerBg, color: c.ownerFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600 }}>
                      {c.ownerInit}
                    </div>
                    <span style={{ fontSize: 10.5, color: "#9aa1aa", marginLeft: "auto", fontFamily: MONO }}>{c.next}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
