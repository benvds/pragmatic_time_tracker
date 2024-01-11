module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        extraFileExtensions: [".json"],
    },
    settings: {
        react: {
            version: "detect",
        },
        "import/resolver": {
            typescript: {},
        },
    },
    env: {
        browser: true,
        node: true,
        jest: true,
    },
    plugins: ["@typescript-eslint", "simple-import-sort"],
    extends: [
        // By extending from a plugin config, we can get recommended rules without having to add them manually.
        "eslint:recommended",
        "plugin:import/typescript",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:jest-dom/recommended",
        "plugin:testing-library/react",
        // This disables the formatting rules in ESLint that Prettier is going to be responsible for handling.
        // Make sure it's always the last config, so it gets the chance to override other configs.
        "eslint-config-prettier",
    ],
    rules: {
        "react/jsx-boolean-value": "warn", // test the eslint fixer with <button disabled={true}> instead of <button disabled>
        "react/react-in-jsx-scope": "off",
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "react-hooks/exhaustive-deps": ["warn"],
        "@typescript-eslint/no-unsafe-assignment": "off", // very much broken
        "@typescript-eslint/no-unsafe-call": "off", // very much broken
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
            },
        ],
    },
    // overrides: [
    //     {
    //         // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching testing files!
    //         files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    //         extends: [
    //         ],
    //     },
    // ],
};
