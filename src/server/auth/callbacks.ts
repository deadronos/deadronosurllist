import type { AuthOptions } from "next-auth";

type AuthCallbacks = NonNullable<AuthOptions["callbacks"]>;

export const authCallbacks: AuthCallbacks = {
  // Persist the user id on the JWT so stateless sessions still expose session.user.id.
  async jwt({ token, user }) {
    if (user?.id) {
      token.id = user.id;
    } else if (!token.id && typeof token.sub === "string") {
      token.id = token.sub;
    }

    return token;
  },
  async session({ session, token, user }) {
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
