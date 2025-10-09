# DESIGN004 – Error Navigation Enhancements

## Overview

Ensure runtime error and 404 pages guide users back to the welcome page by introducing dedicated Radix-themed layouts that highlight recovery actions.

## Architecture

- **Error Boundary Page (`error.tsx`):** Client component rendered on unexpected failures; displays a friendly message with a reset action and a home button.
- **Not Found Page (`not-found.tsx`):** Server component handling 404 cases; mirrors styling with a home button CTA.
- **Shared Styling:** Both pages leverage Radix UI components to stay consistent with the rest of the application.

## Data Flow

1. When an error occurs within the app route, Next.js loads `error.tsx` using the nearest layout (includes global header).
2. Users can click the reset button (provided by Next.js) to reattempt rendering or the home button to navigate back to `/`.
3. For unknown routes, Next.js renders `not-found.tsx`; the home button navigates to `/`.

## Error Handling

- `error.tsx` receives the `reset` callback provided by Next.js; clicking it attempts to rerender the segment.
- Fallback navigation ensures users can always escape to the landing page.

## Testing Strategy

- Manual verification by triggering sample error (e.g., throw in dev) and visiting a missing route, ensuring buttons appear and function.

## Implementation Tasks

1. Create Radix-styled `error.tsx` with reset and home CTAs.
2. Create similar `not-found.tsx` offering guidance and home navigation.
3. Optionally add lightweight smoke tests if the project later introduces integration testing utilities.
