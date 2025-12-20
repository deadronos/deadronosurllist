import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import { parseForESLint } from "@typescript-eslint/parser";

const compat = new FlatCompat({
  baseDirectory: fileURLToPath(new URL(".", import.meta.url)),
});

const tsTypeChecked = compat
  .extends("plugin:@typescript-eslint/recommended-requiring-type-checking")
  .map((c) => ({
    ...c,
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: { parseForESLint },
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
    },
  }));

export default [
  {
    ignores: [".next", "node_modules", "coverage"],
  },

  // NOTE: Skipping `next/core-web-vitals` here due to a config-time circular
  // structure issue when converting that shareable config to flat format.
  // If you prefer the exact `next` behavior, I can switch to a legacy
  // `.eslintrc.cjs` to consume the shareable config directly.

  // Include TypeScript ESLint recommended configs (non-type-checked)
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  // Type-aware rules applied only to TypeScript files
  ...tsTypeChecked,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: { parseForESLint },
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // Restore stricter TypeScript rules
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
];
