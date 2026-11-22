import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  // setup/frontend-plan-alignment: the architecture doc asks for
  // eslint-plugin-jsx-a11y. Next already loads the plugin but turns on only
  // 6 of its rules, so switch on the full recommended set (missing alt text,
  // unlabelled inputs, click handlers without keyboard support, ...).
  // Only the rules are copied: registering the plugin twice is an error.
  {
    files: ["**/*.{js,jsx,mjs}"],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // W1D2-BE: Prisma generates this code; nobody edits it, so don't lint it.
    "src/generated/**",
  ]),
]);

export default eslintConfig;
