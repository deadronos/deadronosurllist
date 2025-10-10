import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/env";
import { isMockDb, prisma } from "@/server/db";

import { authCallbacks } from "./callbacks";
import {
  buildAuthProviders,
  type AuthDiagnostics,
  type AuthEnvShape,
  type AuthProviderDescriptor,
} from "./provider-helpers";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
const authEnv: AuthEnvShape = {
  NODE_ENV: env.NODE_ENV,
  AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
  AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
};

const providerDescriptors: AuthProviderDescriptor[] = [
  {
    id: "discord",
    label: "Discord",
    credentials: {
      clientId: "AUTH_DISCORD_ID",
      clientSecret: "AUTH_DISCORD_SECRET",
    },
    createProvider: ({ clientId, clientSecret }) =>
      DiscordProvider({ clientId, clientSecret }),
  },
  {
    id: "google",
    label: "Google",
    optional: true,
    credentials: {
      clientId: "AUTH_GOOGLE_ID",
      clientSecret: "AUTH_GOOGLE_SECRET",
    },
    createProvider: ({ clientId, clientSecret }) =>
      GoogleProvider({ clientId, clientSecret }),
  },
];

const { providers, diagnostics } = buildAuthProviders(
  authEnv,
  providerDescriptors,
);

if (
  diagnostics.disabledProviders.length > 0 &&
  env.NODE_ENV !== "test" &&
  env.NODE_ENV !== "production"
) {
  diagnostics.disabledProviders.forEach((status) => {
    console.warn(
      `[auth] Disabled ${status.label} provider (${status.reason ?? "unknown reason"}).`,
    );
  });
}

export const authDiagnostics: AuthDiagnostics = diagnostics;

const adapter = isMockDb || !prisma ? undefined : PrismaAdapter(prisma);

export const authConfig = {
  // Ensure NextAuth has a stable secret in production. The env helper makes AUTH_SECRET
  // optional during local development but required in production builds.
  secret: env.AUTH_SECRET,
  providers,
  adapter,
  callbacks: authCallbacks,
  pages: {
    signIn: "/signin",
    error: "/error",
  },
} satisfies NextAuthConfig;
