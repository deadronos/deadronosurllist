import type { NextAuthConfig } from "next-auth";

export const authCallbacks: NonNullable<NextAuthConfig["callbacks"]> = {
  // Persist the user id on the JWT so stateless sessions still expose session.user.id.
  jwt: ({ token, user }) => {
    if (user?.id) {
      token.id = user.id;
    } else if (!token.id && typeof token.sub === "string") {
      token.id = token.sub;
    }

    return token;
  },
  session: ({ session, token, user }) => {
    const idFromCallbacks =
      user?.id ??
      (typeof token.id === "string" ? token.id : undefined) ??
      (typeof token.sub === "string" ? token.sub : undefined);

    if (session.user && idFromCallbacks) {
      session.user.id = idFromCallbacks;
    }

    return session;
  },
};
