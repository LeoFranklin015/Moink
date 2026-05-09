import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "64px auto", padding: 24, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>AIRKit + Frame Builder</h1>
      <p style={{ color: "#555", lineHeight: 1.6 }}>
        Working AIRKit integration with frame builder + embed for X.
      </p>
      <ul style={{ lineHeight: 2 }}>
        <li><Link href="/test">/test</Link> — debug page (issue + verify sanity check)</li>
        <li><Link href="/builder">/builder</Link> — design and save a frame</li>
        <li>/embed/[id] — frame embed (saved configs render here)</li>
      </ul>
    </main>
  );
}
