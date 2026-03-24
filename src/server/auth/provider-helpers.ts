import type { Provider } from "next-auth/providers/index";

export type AuthEnvShape = {
  NODE_ENV: string;
  USE_MOCK_AUTH?: string;
  SKIP_ENV_VALIDATION?: string;
  AUTH_DISCORD_ID?: string;
  AUTH_DISCORD_SECRET?: string;
  AUTH_GOOGLE_ID?: string;
  AUTH_GOOGLE_SECRET?: string;
};

export type AuthProviderDescriptor = {
  id: string;
  label: string;
  optional?: boolean;
  credentials: {
    clientId: keyof AuthEnvShape;
    clientSecret: keyof AuthEnvShape;
  };
  createProvider: (credentials: {
    clientId: string;
    clientSecret: string;
  }) => Provider;
};

export type ProviderStatus = {
  id: string;
  label: string;
  enabled: boolean;
  reason?: string;
};

export type AuthDiagnostics = {
  statuses: ProviderStatus[];
  enabledProviders: ProviderStatus[];
  disabledProviders: ProviderStatus[];
  hasEnabledProvider: boolean;
};

export type AuthProviderBuildResult = {
  providers: Provider[];
  diagnostics: AuthDiagnostics;
};

const PLACEHOLDER_TOKENS = [
  "mock",
  "test",
  "fake",
  "placeholder",
  "changeme",
  "todo",
  "sample",
  "example",
  "xxxx",
  "abcd",
  "your",
];

const isLikelyPlaceholder = (value?: string) => {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  const normalized = trimmed.toLowerCase();
  if (PLACEHOLDER_TOKENS.some((token) => normalized.includes(token))) {
    return true;
  }

  // Very short values are rarely valid client IDs/secrets for OAuth providers.
  // Numeric strings are allowed as they can appear as scientific notation in some environments.
  const isNumeric = /^-?\d+(\.\d+)?(E[+-]?\d+)?$/i.test(trimmed);
  if (!isNumeric && trimmed.length < 10) {
    return true;
  }

  return false;
};

const failureMessage = ({
  idLabel,
  secretLabel,
  idInvalid,
  secretInvalid,
}: {
  idLabel: string;
  secretLabel: string;
  idInvalid: boolean;
  secretInvalid: boolean;
}) => {
  if (idInvalid && secretInvalid) {
    return `${idLabel} and ${secretLabel} are missing or look like placeholder values`;
  }
  if (idInvalid) {
    return `${idLabel} is missing or looks like a placeholder value`;
  }
  return `${secretLabel} is missing or looks like a placeholder value`;
};

const resolveProvider = (
  env: AuthEnvShape,
  descriptor: AuthProviderDescriptor,
  isProduction: boolean,
  isMockAuth: boolean,
  skipEnvValidation: boolean,
): { provider?: Provider; status: ProviderStatus } => {
  const clientId = env[descriptor.credentials.clientId];
  const clientSecret = env[descriptor.credentials.clientSecret];
  const clientIdInvalid = isLikelyPlaceholder(clientId);
  const clientSecretInvalid = isLikelyPlaceholder(clientSecret);

  if (clientIdInvalid || clientSecretInvalid) {
    const reason = failureMessage({
      idLabel: descriptor.credentials.clientId,
      secretLabel: descriptor.credentials.clientSecret,
      idInvalid: clientIdInvalid,
      secretInvalid: clientSecretInvalid,
    });

    if (
      isProduction &&
      !isMockAuth &&
      !skipEnvValidation &&
      !descriptor.optional
    ) {
      throw new Error(
        `[auth] ${descriptor.label} provider misconfigured: ${reason}. Supply valid credentials before deploying.`,
      );
    }

    return {
      status: {
        id: descriptor.id,
        label: descriptor.label,
        enabled: false,
        reason,
      },
    };
  }

  try {
    const provider = descriptor.createProvider({
      clientId: clientId!.trim(),
      clientSecret: clientSecret!.trim(),
    });

    return {
      provider,
      status: {
        id: descriptor.id,
        label: descriptor.label,
        enabled: true,
      },
    };
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Unknown error creating provider configuration";

    if (
      isProduction &&
      !isMockAuth &&
      !skipEnvValidation &&
      !descriptor.optional
    ) {
      throw new Error(
        `[auth] ${descriptor.label} provider failed to initialize: ${reason}`,
      );
    }

    return {
      status: {
        id: descriptor.id,
        label: descriptor.label,
        enabled: false,
        reason,
      },
    };
  }
};

export const buildAuthProviders = (
  env: AuthEnvShape,
  descriptors: AuthProviderDescriptor[],
): AuthProviderBuildResult => {
  const providers: Provider[] = [];
  const statuses: ProviderStatus[] = [];

  const isProduction = env.NODE_ENV === "production";
  const isMockAuth = env.USE_MOCK_AUTH?.toLowerCase() === "true";
  const skipEnvValidation = env.SKIP_ENV_VALIDATION?.toLowerCase() === "true";

  descriptors.forEach((descriptor) => {
    const { provider, status } = resolveProvider(
      env,
      descriptor,
      isProduction,
      isMockAuth,
      skipEnvValidation,
    );

    if (provider) {
      providers.push(provider);
    }
    statuses.push(status);
  });

  const enabledProviders = statuses.filter((status) => status.enabled);
  const disabledProviders = statuses.filter((status) => !status.enabled);

  return {
    providers,
    diagnostics: {
      statuses,
      enabledProviders,
      disabledProviders,
      hasEnabledProvider: enabledProviders.length > 0,
    },
  };
};

export const __private = {
  isLikelyPlaceholder,
};
