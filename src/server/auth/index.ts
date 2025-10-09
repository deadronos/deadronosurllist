import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig, authDiagnostics } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export { auth, authDiagnostics, handlers, signIn, signOut };
