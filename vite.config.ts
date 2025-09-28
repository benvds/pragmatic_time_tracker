/// <reference types="vite/client" />
/// <reference types="vitest/config" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        globals: true,
        environment: "happy-dom",
        setupFiles: "./vitest.setup.ts",
        // you might want to disable it, if you don't have tests that rely on CSS
        // since parsing CSS is slow
        // css: true,
        include: ["src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        coverage: {
            exclude: [
                "playwright.config.ts",
                "prettier.config.mjs",
                "vite.config.ts",
                "dist",
                "tests",
                "src/**/util/*",
            ],
        },
    },
});
