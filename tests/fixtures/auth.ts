import { test as base } from "@playwright/test";

export type AuthSession = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  expires: string;
};

const mockSession: AuthSession = {
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    image: "https://example.com/avatar.jpg",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const test = base.extend<{
  authenticated: boolean;
}>({
  authenticated: [true, { option: true }],
});

export function mockAuthRoute(page, session: AuthSession = mockSession) {
  page.route("**/api/auth/session", async (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(session),
      headers: { "Content-Type": "application/json" },
    });
  });
}

export function mockAuthError(page, status = 401) {
  page.route("**/api/auth/session", async (route) => {
    route.fulfill({
      status,
      body: JSON.stringify({ error: "Unauthorized" }),
      headers: { "Content-Type": "application/json" },
    });
  });
}
