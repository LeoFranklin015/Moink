import type { Metadata } from "next";
import DonatePage from "../frame/page";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nami AI | Donations",
    description:
      "An autonomous agent that discovers global disasters, collect donations and keeps NGO's accountable.",
    openGraph: {
      title: "Nami AI | Donations",
      description:
        "An autonomous agent that discovers global disasters, collect donations and keeps NGO's accountable.",
      images: ["/logo.png"],
    },
    other: {
      "twitter:player": `https://moink.crevn.xyz/embed`,
      "content-security-policy": "frame-ancestors *;",
    },
    twitter: {
      card: "player",
      site: "https://x.com/NamiAIStarknet",
      title: "Nami AI | Donations",
      images: ["https://stark-nami-ai.vercel.app/logo.png"],
      description:
        "An autonomous agent that discovers global disasters, collect donations and keeps NGO's accountable.",
      players: [
        {
          playerUrl: `https://moink.crevn.xyz/embed`,
          streamUrl: `https://moink.crevn.xyz/embed`,
          width: 360,
          height: 560,
        },
      ],
    },
  };
}

export default function EmbedPage() {
  // Directly render the frame content without nested iframe
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#f9fafb",
        overflow: "auto",
      }}
    >
      <DonatePage configId={`configId`} />
    </div>
  );
}
