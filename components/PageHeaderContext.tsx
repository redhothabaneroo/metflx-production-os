"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Header = { title: string; subtitle: string };

const PageHeaderContext = createContext<{ header: Header; setHeader: (h: Header) => void } | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<Header>({ title: "", subtitle: "" });
  return <PageHeaderContext.Provider value={{ header, setHeader }}>{children}</PageHeaderContext.Provider>;
}

export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error("usePageHeaderContext must be used within PageHeaderProvider");
  return ctx;
}

export function PageHeader({ title, subtitle }: Header) {
  const { setHeader } = usePageHeaderContext();
  useEffect(() => {
    setHeader({ title, subtitle });
  }, [title, subtitle, setHeader]);
  return null;
}
