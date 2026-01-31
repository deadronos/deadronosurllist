import Image from "next/image";
import { notFound } from "next/navigation";

import { StudioShell } from "@/app/_components/studio-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server";

export const revalidate = 60;

type UserProfilePageProps = {
  params: { userId: string };
};

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const [user, collections] = await Promise.all([
    api.user.getById({ id: params.userId }),
    api.collection.getByUser({ userId: params.userId }),
  ]);

  if (!user) {
    notFound();
  }

  const displayName = user.name ?? "User profile";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StudioShell>
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`${displayName} avatar`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="text-xl font-semibold">{initial}</span>
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                {displayName}
              </h1>
              <p className="text-muted-foreground text-sm">
                Public collections ({collections.length})
              </p>
            </div>
          </div>

          {collections.length === 0 ? (
            <Card className="bg-background/55 border backdrop-blur">
              <CardContent className="p-6 text-sm text-muted-foreground">
                This user has not published any public collections yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {collections.map((collection) => (
                <Card
                  key={collection.id}
                  className="bg-background/55 border backdrop-blur"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base">
                        {collection.name}
                      </CardTitle>
                      <Badge variant="secondary">Public</Badge>
                    </div>
                    {collection.description ? (
                      <CardDescription className="line-clamp-2">
                        {collection.description}
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    {collection._count?.links ?? 0} links
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </StudioShell>
    </div>
  );
}