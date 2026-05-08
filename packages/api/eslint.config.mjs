import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default defineConfig(
    { ignores: ["**/dist/**/*"] },
    ...tsEslint.configs.strict,
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
        braceStyle: "stroustrup",
        commaDangle: "never"
    }),
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            },
            sourceType: "commonjs",
            parserOptions: {
                projectService: true,
                sourceType: "module"
            }
        },
        rules: {
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-extraneous-class": "off",
            "@typescript-eslint/no-invalid-void-type": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/prefer-literal-enum-member": ["error", { allowBitwiseExpressions: true }],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_.*$",
                    varsIgnorePattern: "^_.*$"
                }
            ],

            "@stylistic/curly-newline": ["error", "always"],
            "@stylistic/operator-linebreak": [
                "error",
                "after",
                {
                    overrides: {
                        "?": "before",
                        ":": "before"
                    }
                }
            ]
        }
    }
);
