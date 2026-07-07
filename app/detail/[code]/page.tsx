import { notFound } from "next/navigation";
import { getClientDetail } from "@/lib/data";
import { PageHeader } from "@/components/PageHeaderContext";
import FolderMenu from "@/components/FolderMenu";
import OnboardingCard from "@/components/OnboardingCard";
import PromoTasksDeliverables from "@/components/PromoTasksDeliverables";
import MonthSection from "@/components/MonthSection";
import ClientInfoCard from "@/components/ClientInfoCard";
import FilesLinksCard from "@/components/FilesLinksCard";

export const dynamic = "force-dynamic";

const MONO = "'IBM Plex Mono', monospace";

export default async function DetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const detail = await getClientDetail(code.toUpperCase());
  if (!detail) notFound();

  return (
    <div style={{ maxWidth: 1480, margin: "0 auto", display: "grid", gridTemplateColumns: "230px minmax(0,1fr)", gap: 18, alignItems: "start" }} className="fadeup">
      <PageHeader title="Project Detail" subtitle={`${detail.name} · ${detail.metaLine}`} />

      <FolderMenu menu={detail.menu} />

      <div>
        <div style={{ background: "#fff", border: "1px solid #e3e6ea", borderRadius: 14, padding: "20px 22px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.01em" }}>{detail.name}</div>
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 5, background: detail.typeBg, color: detail.typeFg }}>{detail.type}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#8a9099", marginTop: 5 }}>{detail.metaLine}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 26 }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: ".08em", color: "#9aa1aa" }}>Next milestone</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, color: "#b45309" }}>{detail.nextMilestone}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", marginTop: 22, overflowX: "auto", paddingBottom: 6 }}>
            {detail.timeline.map((t, i) => (
              <div key={i} style={{ flex: "0 0 92px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: 8, left: "-50%", width: "100%", height: 2, background: t.leftLineBg, zIndex: 0 }} />
                <div style={{ width: 17, height: 17, borderRadius: "50%", background: t.dotBg, border: `2px solid ${t.dotBorder}`, zIndex: 1, flexShrink: 0, transition: "background-color 200ms ease, border-color 200ms ease" }} />
                <div style={{ fontSize: 10, fontWeight: t.weight as React.CSSProperties["fontWeight"], marginTop: 8, color: t.fg, textAlign: "center", lineHeight: 1.2, padding: "0 3px" }}>{t.label}</div>
              </div>
            ))}
          </div>
          {detail.isRetainer && (
            <div style={{ marginTop: 18 }}>
              <div style={{ height: 6, background: "#eef0f3", borderRadius: 3, overflow: "hidden", maxWidth: 320 }}>
                <div style={{ height: "100%", width: `${Math.round((detail.currentMonth / detail.totalMonths) * 100)}%`, background: "#0f766e", borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11.5, color: "#8a9099", marginTop: 6 }}>
                Month {detail.currentMonth} of {detail.totalMonths}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {detail.onboarding.show && <OnboardingCard code={detail.code} onboarding={detail.onboarding} />}
            {detail.isPromo && <PromoTasksDeliverables code={detail.code} detail={detail} />}
            {detail.isRetainer && detail.monthSections.map((ms) => <MonthSection key={ms.month} clientCode={detail.code} section={ms} />)}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <ClientInfoCard code={detail.code} detail={detail} />
            <FilesLinksCard code={detail.code} files={detail.files} />
          </div>
        </div>
      </div>
    </div>
  );
}
