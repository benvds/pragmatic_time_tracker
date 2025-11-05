/// <reference types="vite/client" />
/// <reference types="vitest/config" />
import { spawn } from "node:child_process";

import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { livestoreDevtoolsPlugin } from "@livestore/devtools-vite";

// Plugin to handle WASM files with correct MIME type for LiveStore
const wasmPlugin = () => {
    return {
        name: "wasm-mime-type",
        configureServer(server: any) {
            server.middlewares.use((req: any, res: any, next: any) => {
                if (req.url?.endsWith(".wasm")) {
                    res.setHeader("Content-Type", "application/wasm");
                }
                next();
            });
        },
    };
};

const _wranglerDevPlugin = (): PluginOption => {
    return {
        name: "wrangler-dev",
        configureServer: async (server) => {
            const wrangler = spawn(
                "./node_modules/.bin/wrangler",
                ["dev", "--port", "8787"],
                {
                    stdio: ["ignore", "inherit", "inherit"],
                },
            );

            const shutdown = () => {
                if (wrangler.killed === false) {
                    wrangler.kill();
                }
                process.exit(0);
            };

            server.httpServer?.on("close", shutdown);
            process.on("SIGTERM", shutdown);
            process.on("SIGINT", shutdown);

            wrangler.on("exit", (code) =>
                console.error(`wrangler dev exited with code ${code}`),
            );
        },
    };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        tsconfigPaths(),
        wasmPlugin(),
        // livestoreDevtoolsPlugin({
        //     schemaPath: "./src/features/storage/schema.ts",
        // }),
        // wranglerDevPlugin(),
    ],
    define: {
        // Enable debug mode for dev and test, disable for production
        "import.meta.env.VITE_DEBUG":
            mode === "development" || mode === "test" ? '"true"' : '"false"',
    },
    optimizeDeps: {
        exclude: ["@livestore/wa-sqlite"],
    },
    server: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
    worker: {
        format: "es",
    },
    assetsInclude: ["**/*.wasm"],
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
}));
