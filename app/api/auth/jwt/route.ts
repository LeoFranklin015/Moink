import { NextRequest, NextResponse } from "next/server";
import { importPKCS8, SignJWT } from "jose";

export async function GET(req: NextRequest) {
  const privateKey = process.env.AIRKIT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const partnerId = process.env.NEXT_PUBLIC_PARTNER_ID;
  const kid = process.env.AIRKIT_KEY_ID;
  const scope = req.nextUrl.searchParams.get("scope") ?? undefined;

  if (!privateKey || !partnerId) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }
  const key = await importPKCS8(privateKey, "ES256");
  const payload: Record<string, unknown> = { partnerId };
  if (scope) payload.scope = scope;
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "ES256", kid, typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .setIssuer(partnerId)
    .sign(key);
  return NextResponse.json({ token });
}
