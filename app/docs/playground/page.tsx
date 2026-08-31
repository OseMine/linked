import type { Metadata } from "next";
import Link from "next/link";
import { PlaygroundClient } from "./PlaygroundClient";

export const metadata: Metadata = {
  title: "API Playground — Linked",
  description: "Test every Linked API endpoint directly in your browser with a live Python playground.",
};

export default function PlaygroundPage() {
  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", minHeight: "100vh", padding: "60px 24px 100px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/docs" style={{ color: "#a1a1a6", textDecoration: "none", fontSize: 14, display: "inline-block", padding: "8px 16px", background: "#161617", border: "1px solid #333", borderRadius: 8, marginBottom: 24 }}>
          ← API Reference
        </Link>

        <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6c5ce7" }}>API Reference</div>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: "0 0 12px", letterSpacing: -1, background: "linear-gradient(135deg, #fff 0%, #a1a1a6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Playground</h1>
        <p style={{ fontSize: 16, color: "#a1a1a6", margin: "0 0 40px", lineHeight: 1.6 }}>
          Test every endpoint directly in your browser. Write Python, run it, and see live results — powered by PyScript.
        </p>

        <PlaygroundClient />
      </div>
    </div>
  );
}
