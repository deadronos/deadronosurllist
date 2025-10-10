import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig, authDiagnostics } from "./config";

// Print auth provider diagnostics at startup so logs clearly show which providers
// are enabled or disabled. This helps diagnose noisy UnknownAction errors and
// reveal misconfiguration without exposing secrets.
if (process.env.NODE_ENV !== "test") {
	// Keep the output compact and non-sensitive.
	// eslint-disable-next-line no-console
	console.info('[auth] provider diagnostics:', JSON.stringify(authDiagnostics));
}

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export { auth, authDiagnostics, handlers, signIn, signOut };
