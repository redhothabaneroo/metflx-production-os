"use client";

const FONT_HREF = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

// Loads the Google Fonts stylesheet without blocking rendering: it starts as
// a non-blocking "print" stylesheet and swaps to "all" once loaded, so a
// slow or unreachable font request never freezes first paint / hydration.
export default function FontLoader() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href={FONT_HREF}
        media="print"
        onLoad={(e) => {
          (e.currentTarget as HTMLLinkElement).media = "all";
        }}
      />
      <noscript>
        <link rel="stylesheet" href={FONT_HREF} />
      </noscript>
    </>
  );
}
