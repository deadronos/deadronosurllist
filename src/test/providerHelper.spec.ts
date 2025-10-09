import { describe, expect, it } from 'vitest';

import {
  buildAuthProviders,
  type AuthEnvShape,
  type AuthProviderDescriptor,
  type NextAuthProvider,
  __private,
} from '@/server/auth/provider-helpers';

const createStubProvider = (id: string): NextAuthProvider =>
  ({
    id,
    type: 'oauth',
    options: {},
  }) as NextAuthProvider;

const descriptor = (overrides?: Partial<AuthProviderDescriptor>) =>
  ({
    id: 'demo',
    label: 'Demo',
    credentials: {
      clientId: 'AUTH_DISCORD_ID',
      clientSecret: 'AUTH_DISCORD_SECRET',
    },
    createProvider: () => createStubProvider('demo'),
    ...overrides,
  }) as AuthProviderDescriptor;

const baseEnv: AuthEnvShape = {
  NODE_ENV: 'development',
  AUTH_DISCORD_ID: '123456789012',
  AUTH_DISCORD_SECRET: 'super-secure-secret',
  AUTH_GOOGLE_ID: undefined,
  AUTH_GOOGLE_SECRET: undefined,
};

describe('buildAuthProviders', () => {
  it('enables providers when credentials look valid', () => {
    const result = buildAuthProviders(baseEnv, [descriptor()]);
    expect(result.providers).toHaveLength(1);
    expect(result.diagnostics.hasEnabledProvider).toBe(true);
    expect(result.diagnostics.enabledProviders[0]).toMatchObject({
      id: 'demo',
      enabled: true,
    });
  });

  it('disables providers when credentials look like placeholders', () => {
    const env = {
      ...baseEnv,
      AUTH_DISCORD_ID: 'mock-id',
      AUTH_DISCORD_SECRET: 'mock-secret',
    };
    const result = buildAuthProviders(env, [descriptor()]);
    expect(result.providers).toHaveLength(0);
    expect(result.diagnostics.hasEnabledProvider).toBe(false);
    expect(result.diagnostics.disabledProviders[0]?.reason).toContain('placeholder');
  });

  it('throws in production when a required provider is misconfigured', () => {
    const env = {
      ...baseEnv,
      NODE_ENV: 'production',
      AUTH_DISCORD_ID: undefined,
    };
    expect(() => buildAuthProviders(env, [descriptor()])).toThrowError(/provider misconfigured/i);
  });

  it('allows optional providers to fail without throwing', () => {
    const env = {
      ...baseEnv,
      AUTH_GOOGLE_ID: undefined,
      AUTH_GOOGLE_SECRET: undefined,
    };

    const optionalDescriptor = descriptor({
      id: 'optional',
      label: 'Optional',
      optional: true,
      credentials: {
        clientId: 'AUTH_GOOGLE_ID',
        clientSecret: 'AUTH_GOOGLE_SECRET',
      },
    });

    const result = buildAuthProviders(env, [optionalDescriptor]);
    expect(result.providers).toHaveLength(0);
    expect(result.diagnostics.disabledProviders[0]?.id).toBe('optional');
  });
});

describe('isLikelyPlaceholder', () => {
  const { isLikelyPlaceholder } = __private;

  it('returns true for obvious placeholder tokens', () => {
    expect(isLikelyPlaceholder('mock-value')).toBe(true);
    expect(isLikelyPlaceholder('abcd')).toBe(true);
  });

  it('returns false for realistic credentials', () => {
    expect(isLikelyPlaceholder('123456789012345678')).toBe(false);
    expect(
      isLikelyPlaceholder('xC17h4pz6X9sJVeKv1LmNq3Tr4U5Wy6Z'),
    ).toBe(false);
  });
});
