import type { Metadata } from "next";
import DonatePage from "../../frame/page";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3020";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = getBaseUrl();

  let config: { title?: string; description?: string; backgroundImage?: string } | null = null;
  try {
    const response = await fetch(`${baseUrl}/api/configs?id=${id}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      if (data.success) config = data.config;
    }
  } catch (error) {
    console.error("Error fetching config for metadata:", error);
  }

  const title = config?.title || "Frame";
  const description = config?.description || "Verify and execute on-chain.";
  const logo = config?.backgroundImage || "/logo.png";
  const embedUrl = `${baseUrl}/embed/${id}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [logo] },
    other: {
      "twitter:player": embedUrl,
      "content-security-policy":
        "frame-ancestors 'self' https://twitter.com https://x.com https://platform.twitter.com https://tweetdeck.twitter.com;",
    },
    twitter: {
      card: "player",
      title,
      images: [logo.startsWith("http") ? logo : `${baseUrl}${logo}`],
      description,
      players: [
        { playerUrl: embedUrl, streamUrl: embedUrl, width: 720, height: 720 },
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
  return (
    <div style={{ width: "100%", height: "100vh", backgroundColor: "#f9fafb", overflow: "auto" }}>
      <DonatePage configId={id} />
    </div>
  );
}
