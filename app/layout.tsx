import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import FontLoader from "@/components/FontLoader";

export const metadata: Metadata = {
  title: "Acme Studio — Production OS",
  description: "Video production management platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <FontLoader />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
