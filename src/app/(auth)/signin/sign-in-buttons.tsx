"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Flex, Text } from "@radix-ui/themes";
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
    <Flex direction="column" gap="3">
      {errorCode ? (
        <Text color="red" size="2">
          Sign-in failed ({errorCode}). Try again or contact support if the
          problem persists.
        </Text>
      ) : null}

      {providers.map((provider) => (
        <Button
          key={provider.id}
          size="3"
          className="justify-start"
          variant="solid"
          onClick={() => handleClick(provider.id)}
        >
          {providerButtonLabel(provider.label)}
        </Button>
      ))}
    </Flex>
  );
}
