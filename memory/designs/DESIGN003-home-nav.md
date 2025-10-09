# DESIGN003 – Persistent Home Navigation

## Overview

Provide a consistent way for users to return to the welcome page from any screen by embedding a global navigation control within the root layout.

## Architecture

- **Layout Update:** Extend `src/app/layout.tsx` to render a top-level header with a Home button linking to `/`.
- **Styling:** Use Radix Theme primitives to ensure the control aligns with existing design tokens, keeping the header lightweight and translucent over page backgrounds.
- **Scope:** Applies automatically to all routes leveraging the root layout, including the new `/signin` page.

## Data Flow

1. Every request renders `RootLayout`.
2. Layout header contains a Next.js `Link` pointing to `/`.
3. Clicking the button triggers client-side navigation back to the welcome page.

## Error Handling

- None beyond standard routing; link remains functional even if already on `/`.

## Testing Strategy

- Manual verification across a non-root page (e.g., `/signin`) confirming the button appears and navigates home.

## Implementation Tasks

1. Update `RootLayout` to include a header with Radix-styled home button.
2. Ensure layout content maintains spacing so pages remain visually balanced beneath the header.
