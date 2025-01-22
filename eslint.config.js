import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier'

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
        ignores: ["**/dist/*", "**/*.cjs", "**/*.min.js"]
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    importPlugin.flatConfigs.typescript,
    eslintConfigPrettier,
    {
        rules: {
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
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
        }
    }
)