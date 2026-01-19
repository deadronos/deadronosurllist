import Link from "next/link";

import { auth, authDiagnostics } from "@/server/auth";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

function Brand() {
  return (
    <Link href="/" className="group flex items-baseline gap-2">
      <span className="text-sm font-semibold tracking-tight">Deadronos</span>
      <span className="text-muted-foreground group-hover:text-foreground text-sm transition-colors">
        URL List
      </span>
    </Link>
  );
}

export async function SiteHeader() {
  const session = await auth();
  const hasEnabledProvider = authDiagnostics.hasEnabledProvider;

  const authHref = session ? "/api/auth/signout" : "/signin";
  const authLabel = session
    ? "Sign out"
    : hasEnabledProvider
      ? "Sign in"
      : "Sign-in disabled";

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-background/70 supports-[backdrop-filter]:bg-background/50 absolute inset-0 -z-10 border-b backdrop-blur" />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Brand />
          <nav className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/catalog">Catalog</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {session?.user?.name ? session.user.name : "Menu"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/catalog">Catalog</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                disabled={!hasEnabledProvider && !session}
              >
                <Link href={authHref}>{authLabel}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
