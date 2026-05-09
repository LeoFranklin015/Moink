import { NextRequest, NextResponse } from "next/server";
import { generateAuthToken } from "@/utils";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope");

  if (!scope || (scope !== "issue" && scope !== "verify")) {
    return NextResponse.json(
      { error: "scope query param required: 'issue' or 'verify'" },
      { status: 400 }
    );
  }

  const privateKey = process.env.AIRKIT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const partnerId = process.env.NEXT_PUBLIC_ISSUER_PARTNER_ID;
  const kid = process.env.AIRKIT_KEY_ID;

  if (!privateKey || !partnerId) {
    return NextResponse.json(
      { error: "Server misconfigured: missing AIRKIT_PRIVATE_KEY or PARTNER_ID" },
      { status: 500 }
    );
  }

  try {
    const token = await generateAuthToken({
      privateKey,
      partnerId,
      scope: scope as "issue" | "verify",
      kid: kid || undefined,
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("JWT signing error:", err);
    return NextResponse.json(
      { error: "Failed to generate auth token" },
      { status: 500 }
    );
  }
}
