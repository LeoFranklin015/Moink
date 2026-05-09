import { NextResponse } from "next/server";
import { importPKCS8, exportJWK } from "jose";

export async function GET() {
  const privateKey = process.env.AIRKIT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const kid = process.env.AIRKIT_KEY_ID || "moink-key-1";

  if (!privateKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing AIRKIT_PRIVATE_KEY" },
      { status: 500 }
    );
  }

  try {
    const key = await importPKCS8(privateKey, "ES256", { extractable: true });
    const jwk = await exportJWK(key);

    // Remove private key component — only expose the public key
    delete jwk.d;

    return NextResponse.json(
      {
        keys: [
          {
            ...jwk,
            kid,
            use: "sig",
            alg: "ES256",
          },
        ],
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (err) {
    console.error("JWKS generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate JWKS" },
      { status: 500 }
    );
  }
}
