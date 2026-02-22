import { auth } from "@clerk/nextjs/server";

/**
 * Returns the authenticated user's ID from Clerk.
 * Falls back to mock-auth-id only when not signed in (e.g. dev/testing).
 */
export async function getAuthId(): Promise<string> {
  const { userId } = await auth();
  return userId ?? "mock-auth-id";
}