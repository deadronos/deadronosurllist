"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

type ProviderInfo = { id: string; label: string };

type SignInButtonsProps = {
  providers: ProviderInfo[];
};

const providerButtonLabel = (label: string) => `Continue with ${label}`;

export function SignInButtons({ providers }: SignInButtonsProps) {
  const searchParams = useSearchParams();

  const callbackUrl = useMemo(() => {
    const value = searchParams?.get("callbackUrl");
    return value && value.length > 0 ? value : "/";
  }, [searchParams]);

  const errorCode = searchParams?.get("error");

  const handleClick = useCallback(
    (providerId: string) => {
      void signIn(providerId, { callbackUrl });
    },
    [callbackUrl],
  );

  return (
    <div className="space-y-3">
      {errorCode ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
          Sign-in failed ({errorCode}). Try again or contact support if the
          problem persists.
        </div>
      ) : null}

      {providers.map((provider) => (
        <Button
          key={provider.id}
          size="lg"
          className="w-full justify-between"
          onClick={() => handleClick(provider.id)}
        >
          {providerButtonLabel(provider.label)}
          <ArrowRightIcon className="size-4" />
        </Button>
      ))}
    </div>
  );
}
