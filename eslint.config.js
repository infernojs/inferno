import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintInferno from 'eslint-plugin-inferno'

export default tseslint.config(
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                ...globals.jasmine
            }
        }
    },
    {
        ignores: ["**/dist/*", "**/*.cjs", "**/*.min.js", "**/.react-cache/*"]
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    importPlugin.flatConfigs.typescript,
    eslintInferno.configs.flat.recommended,
    eslintConfigPrettier,
    {
        rules: {
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            // Allow the conventional `_`-prefix to mark intentionally-unused
            // parameters / variables / caught errors / destructured slots.
            // Required when a function signature is dictated by an external
            // contract (e.g. `ComponentBody = (scope, props, extra) => void`)
            // but the implementation only consumes some of the params.
            "@typescript-eslint/no-unused-vars": ["error", {
                "args": "after-used",
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_",
                "destructuredArrayIgnorePattern": "^_",
                "ignoreRestSiblings": true
            }]
        }
    },
    {
        // Specific rules for tests
        files: ["**/__tests__/**"],
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-this-alias": "off",
            "prefer-rest-params": "off",
            "inferno/jsx-key": "off", // There are tests intentionally testing for missing keys
            "inferno/no-children-prop": "off", // There are tests intentionally testing for children prop
            "inferno/no-unescaped-entities": "off"
        }
    }
)