import type { Metadata } from "next";
import DonatePage from "../../frame/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Fetch config to get dynamic metadata
  let config = null;
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
      ? "https://moink.crevn.xyz"
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/configs?id=${id}`, {
      cache: "no-store", // Ensure fresh data for metadata
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        config = data.config;
      }
    }
  } catch (error) {
    console.error("Error fetching config for metadata:", error);
  }

  // Use config values if available, otherwise fallback to defaults
  const title = config?.title || "Promotions";
  const description =
    config?.description ||
    "An autonomous agent that discovers global disasters, collect donations and keeps NGO's accountable.";
  const logo = config?.backgroundImage || "/logo.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [logo],
    },
    other: {
      "twitter:player": `https://moink.crevn.xyz/embed/${id}`,
      "content-security-policy":
        "frame-ancestors 'self' https://twitter.com https://x.com https://platform.twitter.com https://tweetdeck.twitter.com;",
    },
    twitter: {
      card: "player",
      site: "https://x.com/NamiAIStarknet",
      title,
      images: [
        logo.startsWith("http") ? logo : `https://moink.crevn.xyz${logo}`,
      ],
      description,
      players: [
        {
          playerUrl: `https://moink.crevn.xyz/embed/${id}`,
          streamUrl: `https://moink.crevn.xyz/embed/${id}`,
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
