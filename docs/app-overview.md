# Deadronos URL List – Product & Workflow Guide

This guide explains how the Deadronos URL List application is structured, how the core flows work, and how different users interact with collections, links, and authentication. Use it as a companion to the codebase when onboarding new contributors or documenting product behavior.

## Application capabilities

- **Landing experience.** The home page loads the visitor's session, a featured public collection, and the paginated public catalog in parallel. It adapts call-to-action labels based on whether authentication providers are enabled and whether the visitor is already signed in.【F:src/app/page.tsx†L1-L107】
- **Visual framing.** Radix UI components render the hero copy, featured collection card, and catalog feed against a radial gradient background consistent across authenticated and unauthenticated screens.【F:src/app/page.tsx†L44-L142】【F:src/app/dashboard/page.tsx†L24-L67】
- **Featured links.** Each featured collection surfaces up to ten top links with names, optional comments, and external URLs that open in a new tab.【F:src/app/page.tsx†L47-L119】

## Authentication experience

- **Provider diagnostics.** Authentication providers are discovered at runtime using helper diagnostics. The landing page adapts its messaging if no providers are configured, and the dedicated sign-in screen displays enabled buttons alongside diagnostics for disabled providers.【F:src/app/page.tsx†L89-L111】【F:src/app/(auth)/signin/page.tsx†L20-L75】
- **OAuth configuration.** Discord is required by default and Google is optional; both are wired up via NextAuth using Prisma as the adapter when available. The app exposes a shared `authDiagnostics` object to both the landing and sign-in pages so UI states reflect configuration status without duplicating logic.【F:src/server/auth/config.ts†L1-L87】
- **Session-aware navigation.** Pages check the authenticated session before rendering dashboards or collection internals. Unauthenticated users hitting protected routes see guided messaging and a direct link to begin the sign-in flow.【F:src/app/dashboard/page.tsx†L28-L55】【F:src/app/collections/[id]/page.tsx†L23-L43】

## Managing collections

- **Dashboard overview.** Authenticated users hydrate the tRPC client and fetch all of their collections sorted by the persisted `order` field. The header, quick link back to public lists, and create form are arranged within the shared gradient layout.【F:src/app/dashboard/page.tsx†L57-L119】
- **Create workflow.** The dashboard injects a collection creation form that feeds the `collection.create` procedure. New collections compute their order by querying the current maximum and incrementing it server-side.【F:src/app/_components/collection-create-form.tsx†L1-L120】【F:src/server/api/routers/collection.ts†L58-L91】
- **Inline management.** The dashboard manager exposes draggable list items with edit and delete dialogs. It keeps local UI state in sync with server mutations for updates, deletes, and reorder operations, while surfacing optimistic feedback callouts to the user.【F:src/app/_components/dashboard-collections-manager.tsx†L1-L168】
- **API contract.** Collection procedures include guarded queries (`getAll`, `getById`), creation, update, deletion, and reordering. Each mutation validates ownership by comparing the session user with the collection's creator before allowing writes.【F:src/server/api/routers/collection.ts†L26-L154】

## Managing links inside a collection

- **Collection view.** Navigating to `/collections/[id]` fetches the targeted collection plus links, checks ownership, and sorts results by the stored order before hydrating the client-side manager.【F:src/app/collections/[id]/page.tsx†L23-L79】
- **Link lifecycle.** Within the manager, users can toggle public visibility, filter links client-side, reorder via drag-and-drop, and open modal dialogs to edit or delete individual entries. Feedback callouts confirm success or surface errors from the tRPC handlers.【F:src/app/_components/collection-links-manager.tsx†L1-L204】
- **API contract.** Link procedures enforce that link operations occur only within collections owned by the current user. The server assigns incremental `order` values on creation and provides a transactional reorder mutation to persist drag-and-drop changes.【F:src/server/api/routers/link.ts†L1-L103】

## Public catalog and sharing

- **Featured collection.** The `collection.getPublic` query returns the most recently updated public collection (limited to ten links by default) for landing-page highlighting.【F:src/server/api/routers/collection.ts†L18-L37】
- **Catalog pagination.** `collection.getPublicCatalog` wraps a shared fetch helper that returns paginated public collections plus top link summaries for browse experiences. The landing page passes both page size and per-collection link limits to the server and hydrates the `PublicCatalog` component with the initial results.【F:src/server/api/routers/collection.ts†L20-L37】【F:src/app/page.tsx†L20-L37】【F:src/app/_components/public-catalog.tsx†L1-L160】
- **Visibility toggle.** Collection visibility changes propagate through the `collection.update` mutation when toggled from the collection manager, making it straightforward to share or retract a list without altering its content.【F:src/app/_components/collection-links-manager.tsx†L65-L86】【F:src/server/api/routers/collection.ts†L92-L137】

## End-to-end usage flow

1. A visitor lands on `/` and sees either sign-in calls-to-action or a link to their dashboard, plus a featured collection and the public catalog. The layout dynamically reflects available OAuth providers and the signed-in user's name when present.【F:src/app/page.tsx†L44-L112】
2. After signing in, the visitor is redirected to `/dashboard`, which greets them by name, lists existing collections, and offers a form to create new ones.【F:src/app/dashboard/page.tsx†L40-L107】
3. Creating a collection saves it with default visibility (private unless explicitly set otherwise), adds it to the ordered dashboard list, and opens up management actions like edit, delete, and drag-to-reorder.【F:src/server/api/routers/collection.ts†L58-L154】【F:src/app/_components/dashboard-collections-manager.tsx†L34-L168】
4. Drilling into a collection at `/collections/[id]` exposes link-level tools: adding new links, toggling visibility, filtering, editing, deleting, and reordering. Changes persist through corresponding tRPC mutations and reflect immediately in the UI.【F:src/app/collections/[id]/page.tsx†L44-L79】【F:src/app/_components/collection-links-manager.tsx†L63-L204】【F:src/server/api/routers/link.ts†L1-L103】
5. Making a collection public surfaces it in the catalog. Visitors can browse top links without signing in, while authenticated owners continue managing the same list from their dashboard view.【F:src/server/api/routers/collection.ts†L18-L37】【F:src/app/_components/public-catalog.tsx†L1-L160】

## Example user stories

### 1. Research lead curates a collaborative reading list

- *As* a new Deadronos user, *I want* to sign in with Discord so that I can manage collections tied to my account.
- *When* I land on the home page, I see a "Sign in to start collecting" button because OAuth is configured.
- *Then* I authenticate and arrive at the dashboard, where I use the create form to add a "AI Ethics Reading" collection with a short description.
- *So that* I can share it, I open the collection, add curated links with summaries, and toggle the visibility switch to make the list public.【F:src/app/page.tsx†L61-L112】【F:src/app/dashboard/page.tsx†L40-L119】【F:src/app/_components/collection-links-manager.tsx†L63-L171】

### 2. Team member maintains an internal research hub

- *As* a returning member, *I want* to reorder my collections so that the most relevant projects stay at the top of my dashboard.
- *When* I drag items in the dashboard manager, the UI provides immediate feedback and the new order is persisted through the reorder mutation.
- *Then* I open a collection, filter links by keyword to quickly find outdated resources, edit their comments, and delete stale entries.
- *So that* the team sees accurate information, I keep the collection private until we're ready to publish.【F:src/app/_components/dashboard-collections-manager.tsx†L34-L168】【F:src/server/api/routers/collection.ts†L122-L154】【F:src/app/_components/collection-links-manager.tsx†L87-L204】

### 3. Community guest explores public collections

- *As* an unauthenticated visitor, *I want* to browse curated collections to discover useful resources without creating an account.
- *When* I scroll through the public catalog on the landing page, I can open highlighted links in a new tab while seeing curator-provided comments.
- *Then* I decide to sign in later to build my own lists, using the call-to-action buttons that reflect provider availability.
- *So that* I understand the platform status, I review the sign-in page's provider diagnostics before attempting OAuth.【F:src/app/page.tsx†L44-L142】【F:src/server/api/routers/collection.ts†L18-L37】【F:src/app/(auth)/signin/page.tsx†L20-L75】

---

For deeper architectural references (tRPC contracts, schema definitions, and design discussions) continue exploring the existing documentation in `/docs/` and the `memory/` directory.
