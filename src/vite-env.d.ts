/// <reference types="vitest" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEBUG: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface DebugAPI {
    load: () => Promise<void>;
    clear: () => Promise<void>;
    help: () => void;
}

interface Window {
    __debug?: DebugAPI;
}
