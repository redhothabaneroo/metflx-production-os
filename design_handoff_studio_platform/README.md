# Handoff: Metaflx Studio — Video Production Management Platform

## Overview
An internal production-operations tool for a video production studio ("Metaflx Studio"). It tracks two kinds of client engagements — **Retainers** (ongoing monthly video contracts, e.g. 6-month deals delivering 10 videos/month) and **Promo** (one-off project packages, e.g. a 10-video promo shoot) — across their full lifecycle: onboarding → content planning → shoot → post-production → delivery. It gives producers a dashboard, a drag-and-drop post-production Kanban board, a shoot calendar, a client-lifecycle pipeline, and a detailed per-client workspace.

## About the Design Files
The file in this bundle (`Studio Platform.dc.html`) is a **design reference built in HTML** — a working interactive prototype (using inline styles and a small custom templating/component runtime) that demonstrates the intended layout, visual design, copy, and behavior. **It is not production code to copy as-is.** The task is to **recreate this design in the target codebase's existing environment** (React/Vue/etc., with its established state-management, routing, and data-fetching patterns) — or, if no environment exists yet, to choose the most appropriate modern web stack (e.g. React + TypeScript) and implement it there. All data in the prototype is local component state / hardcoded seed data; a real implementation will need a backend/database.

## Fidelity
**High-fidelity.** Colors, typography, spacing, iconography, and interaction patterns (dropdowns, drag-and-drop, collapsible sections, modals, toasts) are final and should be recreated pixel-for-pixel using the codebase's existing component libraries where possible. Copy/microcopy shown is final/example copy — real client names in the prototype (Little Naples, ICAA Law, Grinta, Othman Lawyers, Mimi & Co, Promaz, Extra Cloud, Modern Innovations) are seed data standing in for real client records.

## Screens / Views
The app is a single-page shell with a persistent left sidebar and five main screens, switched via client-side state (no real routing in the prototype — recommend real routes in production: `/dashboard`, `/pipeline`, `/schedule`, `/clients`, `/detail/:code`).

### 1. Sidebar (persistent, all screens)
- Fixed-width dark sidebar (`#15181d` background), collapsible to an icon rail (236px ↔ 66px, 250ms cubic-bezier transition).
- Logo mark (30×30px rounded square, `#3754db`, letter "M") + "Metaflx Studio" / "Production OS" wordmark (IBM Plex Mono, uppercase, letterspaced).
- Collapse toggle button (chevron icon rotates 180° when collapsed).
- Nav items: Dashboard, Video Pipeline, Shoot Schedule, Client Pipeline, Project Detail — each an icon + label, active item highlighted.
- Footer: user avatar (26px circle, initials) + name/role ("Priya · Producer"), pinned to bottom.

### 2. Dashboard
- Two-column layout (`grid-template-columns: minmax(0,1fr) 318px`).
- **Retainers table**: card with header (green dot + "Retainers" + active count + "Pipeline view →" link), horizontally-scrollable data grid. Columns: Client (avatar/code chip + name + type tag), Month (e.g. "3 / 6" + progress bar), Stage (pill badge), Video edits (count + per-stage colored dot distribution), What's next (text + date), Status (pill: on track / off track).
- **Promo table**: same pattern, blue dot, one fewer column (no "Month").
- **Right rail**: "Upcoming" card (shoots/meetings/deadlines this week, color-coded left border) with legend.
- All rows are clickable → navigate to Project Detail for that client.

### 3. Video Production Pipeline (Kanban board)
- Toolbar: explainer text, **"+ Add Videos"** button (opens modal, described below), Promo/Retainer color legend.
- Horizontally-scrollable columns, one per post-production stage: On Queue → Raw Upload → Packaging → Editing → Internal Review → Client Review → Final Delivery.
- Each column: header (colored square + stage name + count), drop zone (dashed border, light gray).
- Inside a column, video cards are **grouped by client** into collapsible "buckets" (click to expand/collapse, shows count badge, colored status dot, and — for retainer clients — an "M{n}" month badge when all cards in that bucket share one contract month).
- Individual video cards (inside an expanded bucket): draggable, selectable (click = multi-select with checkmark), show video code (e.g. `EC001` for promo, `LN0105` for retainer = month 01/video 05), month badge (retainers only), IR/CR (internal/client review round count) badges.
- **Drag-and-drop**: drag one selected card or a whole client bucket onto another column to change its stage. Multi-select banner appears when ≥1 card selected ("N selected — Clear selection").
- Retainer videos only appear here while **not yet at Final Delivery** — once delivered they drop off the board (they remain visible in Project Detail).

### 4. Shoot Schedule
- Week/Month toggle (segmented control, Week active by default).
- 7-day column grid (Mon–Sun), today's column highlighted (`#fbfcff` bg, blue date number).
- Each day lists color-coded event chips (blue = shoot, purple = meeting, orange = deadline) with title/subtitle/CTA button.
- "Needs booking" side list for items lacking a scheduled date.

### 5. Client Pipeline (lifecycle board)
- Horizontal swimlane board: Onboarding → Discovery & Plan → Plan Approval → Shoot Scheduled → In Post → Client Review → Delivered/Live.
- Each lane holds client cards (name, type tag, note, owner avatar, next-action date).
- Legend: Promo (blue) vs Retainer (teal) dot.

### 6. Project Detail (per-client workspace) — the most complex screen
- **Two-column layout**: left "folder menu" sidebar (grouped by Retainers/Promo, collapsible groups, click a client to open it, "+ Add a new client" button opens the Add Client modal) + main content.
- **Client header card**: name + type pill, Account/Editor/Next-milestone stats, then a **horizontally-scrollable milestone timeline** (dots connected by a progress line — green=done, blue=current, gray=future) spanning the full one-off lifecycle (Onboarding → Discovery → Content plan → Shoot → Raw upload → Packaging → Editing → Internal review → Handover → Client review → Final delivery).
- **Promo clients** show a flat **Tasks** panel (collapsible, done/total counter) and a flat **Deliverables** panel (collapsible, list of video codes + due date + stage-status pill) below the header.
- **Retainer clients** instead show **six collapsible "Month N · <Month Year>" sections** (month name computed from the client's actual contract-start date), each containing:
  - A **"Complete"** badge next to the month label once every task in that month is done.
  - A **per-month "Shoot date"** field (date input) — setting it computes that month's 10 deliverables' due dates as **10 business days later** (weekends excluded).
  - A **Tasks** sub-panel: 12 uniform tasks per month — Conduct re-discovery call, Create content plan, Book content plan approval meeting, Content plan approval meeting, Book the shoot, Conduct shoot, Upload raw files, Package content, Editing, Internal review, Client review, Deliver to client. Each task row: owner avatar, task label, (for 3 tasks — content plan, approval meeting, shoot — owner is a **Thomas/Brody dropdown**, otherwise owner is a fixed label), and a status dropdown (Not started / In progress / Complete / **Not applicable** [retainer-only, counts as done] / Pending) with a colored pill + dot.
  - A **Deliverables** sub-panel: that month's video cards (code, due date, stage-status pill).
  - Months before the client's current month are auto-marked complete with delivered videos; the current month starts fresh; future months are empty until reached.
- **Client info card** (right column): editable Business name, editable Contact/Email, editable Contract/Started/Ends fields (click-to-edit text inputs), Shoot date field (**promo clients only**).
- **Files & links card**: three rows (RAW folder, Frame.io review link, Final delivery/Drive) — each an editable text field that becomes a clickable hyperlink once a URL is entered (pencil icon to re-edit).
- **Onboarding checklist** (promo clients only): 8-task checklist (payment invoice, onboarding email/SLA, Slack invite, payment, SLA signed, joined Slack, discovery call booked/complete), collapsible, auto-collapses once fully complete.

### Modals
- **Add a new client**: Retainer/Promo segmented toggle, business name, contact name, email, videos-per-month, contract start/end dates. Creates a new client folder + seeds initial video cards.
- **Add Videos**: client dropdown (auto-detects Promo vs Retainer and shows a type badge), count field, Stage dropdown (options differ by client type), and — retainer only — a Month (1–6) dropdown. On save, generates that many new video cards for the chosen client/month/stage. Closes with a **toast confirmation** ("Added N videos to X — Month N") with a "View" button to jump to that client's Project Detail, rather than auto-navigating away.

## Interactions & Behavior
- **Sidebar collapse**: toggled via button, animates width/label visibility, persists only in-session state (should probably persist to localStorage/user prefs in production).
- **Drag-and-drop stage changes**: HTML5 drag events; dropping onto a column updates the dragged card(s)' `stage` field. Multi-select (click to toggle) lets one drag move many cards at once.
- **Collapsible sections**: chevron rotates ▸/▾, click toggles; several default to a sensible open/closed state (e.g. current month open, others closed; Onboarding auto-collapses when complete) but remember an explicit user toggle once made.
- **Inline editing**: text fields for contact/email/contract dates, Enter or blur commits Files & Links URLs and swaps the input for a clickable link + edit pencil.
- **Derived state, not manual toggles**: the milestone timeline position for a client is **derived from actual task completion state**, not set independently — checking/unchecking a task moves the timeline dot forward or backward accordingly.
- **Business-day math**: shoot date + 10 business days (Mon–Fri only) computes each deliverable's due date, recalculated live when the date changes.
- **Toast pattern**: bottom-center dark toast with success icon, message, "View" action, and dismiss (auto-dismisses after 5s) — used for background actions (Add Videos) that shouldn't force navigation.

## State Management
Key state groups needed in a real implementation (each was a local `state` field in the prototype):
- `screen` — current view/route.
- `videos[]` — promo post-production video records: `{ id, companyCode, code, title, stage, ir, cr }`.
- `retainerVideos[]` — retainer monthly deliverables: `{ id, companyCode, month, num, code, stage }` (code format: `<ClientCode><MM><NN>`, e.g. `LN0105` = Little Naples, month 01, video 05).
- `clientList` / `addedClients[]` — client records (code, name, type, owner, stage, notes, etc.); user-added clients merge into the base seed list.
- `taskStatus{}` — map of `"<clientCode>:<scopeKey>:<taskId>"` → status string, covering onboarding tasks, promo lifecycle tasks, and per-month retainer tasks.
- `taskOwner{}` — map for the 3 reassignable tasks per client (owner override, Thomas/Brody).
- `shootDates{}` — promo per-client shoot date, **and** retainer per-client-per-month shoot date (`"<code>:m<N>"` key), used to compute deliverable due dates.
- `fileLinks{}` / `fileEditing{}` — Files & Links URLs and their edit/view toggle state per client.
- `infoEdits{}` — per-client overrides for Contact/Email/Contract/Started/Ends fields.
- `sectionCollapsed{}` — generic collapse-state map keyed per section (tasks/deliverables/month/onboarding) per client.
- `expanded{}` / `selected{}` — Kanban board bucket-expansion and multi-select state.
- `showAddClient` / `form`, `showAddVideos` / `addVideosForm`, `toast` — modal and notification state.

In production, most of the above (clients, videos, tasks, links) should be persisted server-side, not client state — this was all local/in-memory for the prototype.

## Design Tokens

### Colors
- **Backgrounds**: page `#eef0f3`, cards `#ffffff`, sidebar `#15181d`, sidebar hover/border `#262b33`.
- **Text**: primary `#1a1d21`, secondary `#5b6470` / `#6b7280`, muted/labels `#9aa1aa` / `#8a9099`.
- **Brand blue** (Promo, primary actions, links): `#3754db` / hover states in `#eef1fd` (bg) `#d4ddfb` (border).
- **Teal** (Retainer accent): `#0f766e`.
- **Purple** (Internal review / meetings): `#7c3aed`, bg `#f1ecfd`.
- **Green** (success / complete / on-track): `#15803d` / `#16a34a`, bg `#e9f6ee`.
- **Amber/orange** (pending / warning / deadlines): `#b45309` / `#d97706`, bg `#fdf3e7`.
- **Red** (blocked / off-track / bad): `#c2353a` / `#e5484d`, bg `#fdecec`.
- **Borders**: `#e3e6ea` (cards), `#eef0f3` (dividers), `#dde1e6` (inputs).

### Typography
- **UI font**: IBM Plex Sans (400/500/600/700) — via Google Fonts.
- **Mono/label font**: IBM Plex Mono (400/500/600) — used for all-caps labels, codes, dates, badges, letter-spaced eyebrow text.
- Sizes range ~9px (mono eyebrow labels) to 20px (client name headers); body copy typically 12.5–13px.

### Spacing / Radius
- Card radius: 14px (large cards), 9–11px (buttons/inputs/badges), pill badges use 4–7px.
- Standard card padding: 18–22px.
- Grid gaps: 14–18px between cards/columns.

### Motion
- Sidebar collapse: `250ms cubic-bezier(0.22, 1, 0.36, 1)`.
- Fade-up entrance on screen change: `fadeup 0.3–0.4s ease-out` (translateY(6px) → 0).

## Assets
No external images/icons — all iconography is inline SVG (stroke-based, ~15–17px, 2px stroke width, Lucide-style geometric icons: rect/circle/path primitives for dashboard, pipeline, calendar, folder, chevron, plus, check, arrow, edit-pencil, link-out glyphs). No logo asset file; the "M" mark is a styled div, not an image.

## Files
- `Studio Platform.dc.html` — the complete design reference (single file, all screens/state/logic included). This is the file to reference screen-by-screen when rebuilding.
