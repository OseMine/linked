"use client";

import Script from "next/script";
import dynamic from "next/dynamic";

const PlaygroundClient = dynamic(() => import("./PlaygroundClient").then(m => m.PlaygroundClient), {
  ssr: false,
  loading: () => (
    <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 20, height: 520, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#a1a1a6", fontSize: 14 }}>Loading playground...</span>
    </div>
  ),
});

export function PlaygroundDynamic() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"
        strategy="afterInteractive"
      />
      <PlaygroundClient />
    </>
  );
}
