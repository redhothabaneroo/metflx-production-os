// Shared design tokens & business logic ported from the Studio Platform design reference.

export const STAGES = [
  "Raw Upload",
  "Packaging",
  "Editing",
  "Internal Review",
  "Revision",
  "Client Review",
  "Final Delivery",
] as const;

export const PIPELINE_STAGES = ["On Queue", ...STAGES] as const;

export const PROMO_STAGE_OPTIONS = [...PIPELINE_STAGES];
export const RETAINER_STAGE_OPTIONS = ["On Queue", "Editing", "Internal Review", "Final Delivery"];

export const TASK_STATUS_OPTIONS = ["Not started", "In progress", "Complete", "Not applicable", "Pending"];

export function isTaskDone(status: string) {
  return status === "Complete" || status === "Not applicable";
}

export function isMonthTaskListComplete(defs: { id: string }[], statusMap: Map<string, string>) {
  return defs.every((d) => isTaskDone(statusMap.get(d.id) || "Not started"));
}

export const TASK_STATUS_STYLE: Record<string, { bg: string; fg: string; dot: string; border: string }> = {
  "Not started": { bg: "#eef0f3", fg: "#7b828c", dot: "#aeb4bd", border: "#e0e3e8" },
  "In progress": { bg: "#eef1fd", fg: "#3754db", dot: "#3754db", border: "#d4ddfb" },
  Complete: { bg: "#e9f6ee", fg: "#15803d", dot: "#16a34a", border: "#cde7d6" },
  "Not applicable": { bg: "#e9f6ee", fg: "#15803d", dot: "#16a34a", border: "#cde7d6" },
  Pending: { bg: "#fdf3e7", fg: "#b45309", dot: "#d97706", border: "#f6e2c4" },
};

export const DELIV_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  "On Queue": { label: "On queue", bg: "#f1f3f6", fg: "#8a9099" },
  "Raw Upload": { label: "Raw upload", bg: "#eef0f3", fg: "#9aa1aa" },
  Packaging: { label: "Packaging", bg: "#eef0f3", fg: "#475569" },
  Editing: { label: "Editing", bg: "#eef1fd", fg: "#3754db" },
  "Internal Review": { label: "Internal review", bg: "#f1ecfd", fg: "#7c3aed" },
  Revision: { label: "Revision", bg: "#fdeef0", fg: "#be123c" },
  "Client Review": { label: "Client review", bg: "#fdf3e7", fg: "#b45309" },
  "Final Delivery": { label: "Delivered", bg: "#e9f6ee", fg: "#15803d" },
};

export function stageStyle(stage: string) {
  const map: Record<string, { bg: string; fg: string }> = {
    "On Queue": { bg: "#f1f3f6", fg: "#8a9099" },
    "Raw Upload": { bg: "#eef0f3", fg: "#6b7280" },
    Packaging: { bg: "#eef0f3", fg: "#475569" },
    Editing: { bg: "#eef1fd", fg: "#3754db" },
    "Internal Review": { bg: "#f1ecfd", fg: "#7c3aed" },
    Revision: { bg: "#fdeef0", fg: "#be123c" },
    "Client Review": { bg: "#fdf3e7", fg: "#b45309" },
    "Final Delivery": { bg: "#e9f6ee", fg: "#15803d" },
  };
  return map[stage] || { bg: "#eef0f3", fg: "#6b7280" };
}

export function typeStyle(type: string) {
  if (type === "Promo") return { bg: "#eef1fd", fg: "#3754db" };
  if (type === "Repeat") return { bg: "#fde8d9", fg: "#c2410c" };
  return { bg: "#e9f4f1", fg: "#0f766e" };
}

// Repeat clients are month-to-month (no lock-in contract) but otherwise
// follow the exact same monthly production cycle as retainer clients.
export function isRecurring(type: string) {
  return type === "RETAINER" || type === "REPEAT";
}

export function clientTypeLabel(type: string): "Retainer" | "Promo" | "Repeat" {
  if (type === "PROMO") return "Promo";
  if (type === "REPEAT") return "Repeat";
  return "Retainer";
}

const AVATAR_MAP: Record<string, { bg: string; fg: string; initials: string }> = {
  Alex: { bg: "#dfe8ff", fg: "#3754db", initials: "AL" },
  Casey: { bg: "#e3eafe", fg: "#3754db", initials: "CA" },
  Sam: { bg: "#ede0fb", fg: "#7c3aed", initials: "SA" },
  Devon: { bg: "#d9efe6", fg: "#0f766e", initials: "DE" },
  Taylor: { bg: "#ede0fb", fg: "#7c3aed", initials: "TA" },
  Quinn: { bg: "#e3eafe", fg: "#3754db", initials: "QU" },
  Jordan: { bg: "#fde7d6", fg: "#b45309", initials: "JO" },
};

export function avatar(name: string) {
  return AVATAR_MAP[name] || { bg: "#e7eaef", fg: "#6b7280", initials: (name || "—").slice(0, 2).toUpperCase() };
}

// Adds `n` business days (Mon-Fri) to an ISO date string, returns an ISO date string.
export function addBusinessDays(iso: string | Date | null | undefined, n: number): Date | null {
  if (!iso) return null;
  const d = typeof iso === "string" ? new Date(iso + "T00:00:00") : new Date(iso);
  if (isNaN(d.getTime())) return null;
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateShort(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function toDateInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

// Promo lifecycle task list (also base for month tasks, minus retainer-only rediscovery task)
export const TASK_DEFS = [
  { id: "plan", label: "Create content plan", owner: "Alex", m: 2 },
  { id: "bookapproval", label: "Book content plan approval meeting", owner: "Jordan", m: 2 },
  { id: "approval", label: "Content plan approval meeting", owner: "Alex", m: 3 },
  { id: "bookshoot", label: "Book the shoot", owner: "Jordan", m: 4 },
  { id: "shoot", label: "Conduct shoot", owner: "Alex", m: 5 },
  { id: "upload", label: "Upload raw files", owner: "Casey", m: 6 },
  { id: "package", label: "Package content", owner: "Sam", m: 7 },
  { id: "editing", label: "Editing", owner: "Quinn", m: 8 },
  { id: "internalreview", label: "Internal review", owner: "Alex", m: 9 },
  { id: "clientreview", label: "Client review", owner: "Sam", m: 12 },
  { id: "bookhandover", label: "Book handover meeting", owner: "Alex", m: 10 },
  { id: "handover", label: "Conduct handover meeting", owner: "Alex", m: 11 },
  { id: "deliver", label: "Final delivery to Drive", owner: "Sam", m: 13 },
];

export const RETAINER_TASK_DEFS = [
  { id: "rediscovery", label: "Conduct re-discovery call", owner: "Casey", m: 1 },
  { id: "plan", label: "Create content plan", owner: "Alex", m: 2 },
  { id: "bookapproval", label: "Book content plan approval meeting", owner: "Jordan", m: 2 },
  { id: "approval", label: "Content plan approval meeting", owner: "Alex", m: 3 },
  { id: "bookshoot", label: "Book the shoot", owner: "Jordan", m: 4 },
  { id: "shoot", label: "Conduct shoot", owner: "Alex", m: 5 },
  { id: "upload", label: "Upload raw files", owner: "Casey", m: 6 },
  { id: "package", label: "Package content", owner: "Sam", m: 7 },
  { id: "editing", label: "Editing", owner: "Quinn", m: 8 },
  { id: "internalreview", label: "Internal review", owner: "Alex", m: 9 },
  { id: "clientreview", label: "Client review", owner: "Sam", m: 12 },
  { id: "deliver", label: "Deliver to client", owner: "Sam", m: 13 },
];

// Repeat clients bill month-to-month with no lock-in contract, so each
// month's checklist opens with confirming that month's invoice was paid.
export const INVOICE_TASK_ID = "invoicepaid";

export const REPEAT_TASK_DEFS = [{ id: INVOICE_TASK_ID, label: "Invoice paid", owner: "Jordan", m: 1 }, ...RETAINER_TASK_DEFS];

export const OWNER_EDITABLE_TASKS = ["plan", "approval", "shoot", "rediscovery"];

export const ONBOARDING_TASK_DEFS = [
  { id: "invoice", label: "Payment invoice sent", owner: "Jordan" },
  { id: "onbemail", label: "Send onboarding email and SLA", owner: "Jordan" },
  { id: "slackinvite", label: "Slack invite sent", owner: "Jordan" },
  { id: "payment", label: "Payment complete", owner: "Jordan" },
  { id: "sla", label: "SLA signed", owner: "Jordan" },
  { id: "joined", label: "Joined Slack", owner: "Jordan" },
  { id: "discbook", label: "Discovery call booked", owner: "Jordan" },
  { id: "disccomplete", label: "Discovery call complete", owner: "Jordan" },
];

export const MILESTONE_LABELS = [
  "Onboarding",
  "Discovery call complete",
  "Content plan complete",
  "Content plan approved",
  "Shoot booked",
  "Shoot complete",
  "Raw files uploaded",
  "Raw files packaged",
  "Editing",
  "Internal review",
  "Handover meeting booked",
  "Handover complete",
  "Client review",
  "Final delivery",
];

export const TEAM_MEMBERS = ["Alex", "Jordan", "Sam", "Casey"];

export const VIDEO_TITLES = [
  "Hero film",
  "Promo",
  "Testimonial",
  "Short — tip",
  "Teaser",
  "Spotlight",
  "Walkthrough",
  "CTA short",
  "Story",
  "Reel",
];
