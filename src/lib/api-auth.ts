import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

export async function getApiUser() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("authjs.session-token")?.value ??
    cookieStore.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) return null;

  const decoded = await decode({
    token: sessionToken,
    secret: process.env.NEXTAUTH_SECRET!,
    salt: cookieStore.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  if (!decoded?.id) return null;

  return {
    id: decoded.id as string,
    name: (decoded.name as string) ?? null,
    email: (decoded.email as string) ?? null,
    role: (decoded.role as string) ?? "user",
  };
}
