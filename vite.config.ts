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
        setupFiles: "./test/vitest.setup.ts",
        // you might want to disable it, if you don't have tests that rely on CSS
        // since parsing CSS is slow
        // css: true,
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/cypress/**",
            "**/.{idea,git,cache,output,temp}/**",
            "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
            "**/e2e/**",
            "**/*.e2e.*",
        ],
    },
});
