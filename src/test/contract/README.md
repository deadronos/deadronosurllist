# Contract/Integration Tests

This directory contains contract and integration tests that verify consistency between:
- tRPC router input schemas (Zod)
- Frontend form schemas
- Prisma database schema
- Authentication and authorization boundaries

## Test Categories

### 1. Prisma Schema Snapshot (`prisma-snapshot.spec.ts`)
Captures the Prisma schema structure and fails on unintended changes to:
- Model fields
- Database indexes (critical for RLS policies)
- Cascade delete rules
- Relations between models

### 2. Router Integration Tests
- `collection-router.integration.spec.ts` - Tests collection CRUD operations
- `link-router.integration.spec.ts` - Tests link CRUD operations

These tests verify:
- Valid input creates/updates/deletes correctly
- Invalid input is rejected
- Authentication is required for protected procedures
- Ownership checks prevent unauthorized access

### 3. Schema Contract Tests (`schema-contracts.spec.ts`)
Validates that Zod schemas in routers:
- Accept valid input
- Reject invalid input
- Match expected shapes

### 4. Form Contract Tests (`form-contracts.spec.ts`)
Ensures frontend form schemas match backend tRPC schemas to prevent drift.

### 5. Auth Boundary Tests (`auth-boundaries.spec.ts`)
Verifies:
- Public procedures work without authentication
- Protected procedures require authentication
- Ownership checks enforce access control

## Running Tests

```bash
# Run all contract tests
npm run test:contract

# Run specific test file
npm run test:contract -- prisma-snapshot

# Run in watch mode
npm run test:contract:watch
```

## When Tests Fail

1. **Snapshot failures**: Review the diff to ensure changes are intentional
2. **Schema contract failures**: Update either frontend or backend schema to match
3. **Auth boundary failures**: Verify authentication/authorization logic

## Adding New Tests

When adding new routers or forms:
1. Add integration tests for mutation paths
2. Add schema contract tests for input validation
3. Add form contract tests if frontend forms exist
4. Update snapshots if schema changes are intentional
