# Requirements – LinkList

## Public Welcome Experience

- WHEN the mock database initializes, THE SYSTEM SHALL ensure a public collection named "Discover Links" exists with at least the default link `https://github.com` [Acceptance: unit test or direct call to the mock DB confirms collection with `isPublic=true` and the link entry present].
- WHEN an unauthenticated caller requests the public collection via tRPC, THE SYSTEM SHALL return the collection metadata and ordered links without requiring a session [Acceptance: unit test for the `collection.getPublic` procedure].
- WHEN a visitor loads the root `/` page, THE SYSTEM SHALL present the welcome layout that highlights the public collection links and authentication call-to-action using the Radix UI theme [Acceptance: manual UI check verifying hero content and Radix Theme wrapper].

## Authentication & Access Control

- WHEN an unauthenticated visitor opens `/dashboard` or `/collections/[id]`, THE SYSTEM SHALL redirect them toward sign-in messaging instead of exposing member data [Acceptance: server component renders call-to-action verified via integration test or manual check].
- WHEN an authenticated user calls a protected tRPC procedure, THE SYSTEM SHALL scope all queries and mutations to `ctx.session.user.id` [Acceptance: router unit tests expect FORBIDDEN when accessing data owned by another user].

## Collection Management

- WHEN a signed-in member submits the collection creation form with a non-empty name, THE SYSTEM SHALL persist the collection, associate it with the member, and refresh the dashboard listing [Acceptance: UI smoke test or mutation unit test confirming reuse of `collection.create`].
- WHEN a member requests their collections, THE SYSTEM SHALL return them ordered by `updatedAt` descending including link counts [Acceptance: unit test for `collection.getAll`].
- WHEN a member fetches a collection they own by ID, THE SYSTEM SHALL return ordered links or `null` if absent [Acceptance: unit test for `collection.getById` covering ownership].

## Link Management

- WHEN a member submits a valid link (URL + name) for one of their collections, THE SYSTEM SHALL assign the next available `order` and persist the record [Acceptance: unit or integration test for `link.create`].
- WHEN a member updates, deletes, or reorders a link, THE SYSTEM SHALL verify the owning collection belongs to the member before applying changes [Acceptance: link router tests expect FORBIDDEN on foreign collections].
