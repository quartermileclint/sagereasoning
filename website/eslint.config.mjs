import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    extends: [...nextCoreWebVitals],

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },
}, {
    files: [
        "src/lib/guardrails.ts",
        "src/lib/r20a-classifier.ts",
        "src/lib/r20a-cost-tracker.ts",
        "src/lib/context/practitioner-context.ts",
    ],

    rules: {
        // Ported verbatim from the pre-Next-16 .eslintrc.json override, with one
        // addition: `caughtErrors: "none"`. ESLint 9 changed this option's default
        // from "none" to "all", so the ported rule would newly error on unused
        // catch bindings in these four safety-critical modules — a change in what
        // the pre-commit hook enforces, not a change any code here made. Pinning it
        // preserves the exact pre-upgrade semantics. Revisit deliberately (with the
        // wider lint debt) rather than as a side effect of a framework bump.
        "no-unused-vars": ["error", {
            vars: "all",
            args: "after-used",
            ignoreRestSiblings: true,
            caughtErrors: "none",
        }],
    },
}]);