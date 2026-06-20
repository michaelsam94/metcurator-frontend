import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        AbortController: "readonly",
        fetch: "readonly",
        Request: "readonly",
        Headers: "readonly",
        HTMLInputElement: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    }
  }
];
