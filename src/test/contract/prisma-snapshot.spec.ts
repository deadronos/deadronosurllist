import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Prisma Schema Snapshot', () => {
  const schemaPath = join(process.cwd(), 'prisma/schema.prisma');
  const schema = readFileSync(schemaPath, 'utf-8');

  it('should match expected schema structure', () => {
    // Extract models and their fields
    const models = extractModels(schema);

    // Snapshot the entire structure
    expect(models).toMatchInlineSnapshot(`
      {
        "Account": {
          "fields": [
            "id",
            "userId",
            "type",
            "provider",
            "providerAccountId",
            "refresh_token",
            "access_token",
            "expires_at",
            "token_type",
            "scope",
            "id_token",
            "session_state",
            "refresh_token_expires_in",
          ],
          "indexes": [],
        },
        "Collection": {
          "fields": [
            "id",
            "name",
            "description",
            "order",
            "isPublic",
            "createdAt",
            "updatedAt",
            "createdById",
          ],
          "indexes": [
            "createdById",
            "createdAt",
            "order",
            "isPublic, updatedAt",
          ],
        },
        "Link": {
          "fields": [
            "id",
            "url",
            "name",
            "comment",
            "order",
            "createdAt",
            "updatedAt",
            "collectionId",
          ],
          "indexes": [
            "collectionId",
            "order",
          ],
        },
        "Session": {
          "fields": [
            "id",
            "sessionToken",
            "userId",
            "expires",
          ],
          "indexes": [],
        },
        "User": {
          "fields": [
            "id",
            "name",
            "email",
            "emailVerified",
            "image",
          ],
          "indexes": [],
        },
        "VerificationToken": {
          "fields": [
            "identifier",
            "token",
            "expires",
          ],
          "indexes": [],
        },
      }
    `);
  });

  it('should have required indexes for RLS policies', () => {
    // Verify critical indexes exist
    expect(schema).toContain('@@index([createdById])');
    expect(schema).toContain('@@index([isPublic, updatedAt])');
    expect(schema).toContain('@@index([collectionId])');
    expect(schema).toContain('@@index([order])');
  });

  it('should have cascade deletes for user relations', () => {
    // Count cascade deletes (should be at least 3: Account->User, Session->User, Collection->User)
    const cascadeCount = (schema.match(/onDelete: Cascade/g) || []).length;
    expect(cascadeCount).toBeGreaterThanOrEqual(3);
  });

  it('should have proper unique constraints', () => {
    // Verify unique constraints exist
    expect(schema).toContain('@unique'); // For email, sessionToken, etc.
    expect(schema).toContain('@@unique([provider, providerAccountId])');
    expect(schema).toContain('@@unique([identifier, token])');
  });
});

function extractModels(schema: string) {
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  const models: Record<string, { fields: string[]; indexes: string[] }> = {};

  // Known model names to identify relation fields
  const modelNamesArray: string[] = [];

  // First pass: collect all model names
  let match: RegExpExecArray | null;
  while ((match = modelRegex.exec(schema)) !== null) {
    if (match[1]) {
      modelNamesArray.push(match[1]);
    }
  }

  // Reset regex
  modelRegex.lastIndex = 0;

  // Second pass: extract fields and indexes
  while ((match = modelRegex.exec(schema)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];

    if (!modelName || !modelBody) continue;

    const lines = modelBody.split('\n');
    const fields: string[] = [];
    const indexes: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      if (trimmed.startsWith('@@index')) {
        const indexMatch = trimmed.match(/@@index\(\[([^\]]+)\]\)/);
        if (indexMatch?.[1]) {
          indexes.push(indexMatch[1]);
        }
      } else if (trimmed.startsWith('@@unique')) {
        // Skip unique constraints
      } else if (!trimmed.startsWith('@@')) {
        const fieldMatch = trimmed.match(/^(\w+)\s+/);
        if (fieldMatch?.[1]) {
          const fieldName = fieldMatch[1];
          // Skip relation fields:
          // - Fields with @relation attribute
          // - Fields that are arrays of other models (e.g., Link[])
          // - Fields that reference other model types
          const isRelation =
            trimmed.includes('@relation') ||
            trimmed.endsWith('[]') || // Array of relations
            modelNamesArray.some(name => trimmed.includes(name) && !trimmed.includes('String') && !trimmed.includes('Int') && !trimmed.includes('Boolean') && !trimmed.includes('DateTime'));

          if (!isRelation) {
            fields.push(fieldName);
          }
        }
      }
    }

    models[modelName] = { fields, indexes };
  }

  return models;
}
