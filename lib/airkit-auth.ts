export async function getAuthToken(
  scope: "issue" | "verify"
): Promise<string> {
  const res = await fetch(`/api/auth/jwt?scope=${scope}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to get auth token (${res.status})`);
  }
  const { token } = await res.json();
  return token;
}
