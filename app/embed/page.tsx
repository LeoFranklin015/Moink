import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nami AI | Donations",
    description:
      "An autonomous agent that discovers global disasters, collect donations and keeps NGO’s accountable.",
    openGraph: {
      title: "Nami AI | Donations",
      description:
        "An autonomous agent that discovers global disasters, collect donations and keeps NGO’s accountable.",
      images: ["/logo.png"],
    },
    other: {
      "twitter:player": `https://moink.vercel.app/embed`,
      "x-frame-options": "ALLOWALL",
      "content-security-policy": "frame-ancestors *;",
    },
    twitter: {
      card: "player",
      site: "https://x.com/NamiAIStarknet",
      title: "Nami AI | Donations",
      images: ["https://stark-nami-ai.vercel.app/logo.png"],
      description:
        "An autonomous agent that discovers global disasters, collect donations and keeps NGO’s accountable.",
      players: [
        {
          playerUrl: `https://moink.vercel.app/embed`,
          streamUrl: `https://moink.vercel.app/embed`,
          width: 360,
          height: 560,
        },
      ],
    },
  };
}
export default function EmbedPage() {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
      <iframe
        src={`/frame`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        allow="fullscreen; web3"
      ></iframe>
    </div>
  );
}
