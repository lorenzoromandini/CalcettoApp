import { cookies } from "next/headers";
import { cache } from "react";

export interface AppSession {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  image: string | null;
}

export const getSession = cache(async (): Promise<AppSession | null> => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app-session");

    if (sessionCookie?.value) {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString("utf-8")
      );
      return sessionData as AppSession;
    }

    return null;
  } catch {
    return null;
  }
});

export function parseSessionFromToken(token: string): AppSession | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    return JSON.parse(decoded) as AppSession;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
