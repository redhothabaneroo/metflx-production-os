"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { PageHeaderProvider } from "./PageHeaderContext";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <PageHeaderProvider>
      <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: "auto", padding: "24px 26px 60px" }}>{children}</main>
        </div>
      </div>
    </PageHeaderProvider>
  );
}
