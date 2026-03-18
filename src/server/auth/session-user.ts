import type { Session } from "next-auth";

export const getSessionUserId = (session: Session | null): string => {
  if (typeof session?.user?.id !== "string") {
    return "";
  }

  return session.user.id.trim();
};
