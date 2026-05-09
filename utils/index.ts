import { importPKCS8, SignJWT } from "jose";

export const isUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const ALG = "ES256";

export const generateAuthToken = async ({
  privateKey,
  partnerId,
  scope,
  kid,
  email,
  partnerUserId,
}: {
  privateKey: string;
  partnerId: string;
  scope?: "issue" | "verify";
  kid?: string;
  email?: string;
  partnerUserId?: string;
}) => {
  const payload: Record<string, unknown> = { partnerId };
  if (scope) payload.scope = scope;
  if (email) payload.email = email;
  if (partnerUserId) payload.partnerUserId = partnerUserId;

  const key = await importPKCS8(privateKey, ALG);
  const header: { alg: string; kid?: string } = { alg: ALG };
  if (kid) header.kid = kid;

  return await new SignJWT(payload)
    .setProtectedHeader(header)
    .setExpirationTime("5m")
    .setIssuedAt()
    .setIssuer(partnerId)
    .sign(key);
};
