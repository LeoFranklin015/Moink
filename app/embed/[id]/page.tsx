import type { Metadata } from "next";
import DonatePage from "../../frame/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

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
      "twitter:player": `https://fastest-salary-seed-headlines.trycloudflare.com/embed/${id}`,
      "content-security-policy":
        "frame-ancestors 'self' https://twitter.com https://x.com https://platform.twitter.com https://tweetdeck.twitter.com;",
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
          playerUrl: `https://fastest-salary-seed-headlines.trycloudflare.com/embed/${id}`,
          streamUrl: `https://fastest-salary-seed-headlines.trycloudflare.com/embed/${id}`,
          width: 360,
          height: 560,
        },
      ],
    },
  };
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log(id);
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
      <DonatePage configId={id} />
    </div>
  );
}
