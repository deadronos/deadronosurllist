import Link from "next/link";

import { FrownIcon } from "lucide-react";

import { StudioShell } from "@/app/_components/studio-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The 404 Not Found page.
 * Displayed when a user navigates to a non-existent route.
 *
 * @returns {JSX.Element} The not found page component.
 */
export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StudioShell>
        <div className="mx-auto max-w-2xl">
          <Card className="bg-background/55 border backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FrownIcon className="text-muted-foreground size-5" />
                Page not found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                We couldn&apos;t locate the page you requested. It might have
                been moved or removed.
              </p>
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </StudioShell>
    </div>
  );
}
