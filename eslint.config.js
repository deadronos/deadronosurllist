import { fileURLToPath } from "node:url";
import { parseForESLint } from "@typescript-eslint/parser";

export default [
  {
    ignores: [".next", "node_modules"],
  },
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
      // Minimal rule set for now to avoid config-time errors. We'll re-add stricter
      // rules in a follow-up once the config is stabilized.
    },
  },
];
