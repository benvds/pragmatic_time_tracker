/// <reference types="vitest" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEBUG: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface DebugAPI {
    load: () => void;
    clear: () => void;
    downloadDb: () => void;
    downloadEventlog: () => void;
    syncStates: () => void;
    help: () => void;
}

interface LiveStoreDevHelpers {
    downloadDb: () => void;
    downloadEventlogDb: () => void;
    hardReset: () => void;
    syncStates: () => unknown;
}

interface LiveStoreDebugInstance {
    _dev: LiveStoreDevHelpers;
}

interface LiveStoreDebug {
    [storeId: string]: LiveStoreDebugInstance;
}

declare global {
    interface Window {
        __debug?: DebugAPI;
        __debugLiveStore?: LiveStoreDebug;
    }

    // eslint-disable-next-line no-var
    var __debugLiveStore: LiveStoreDebug | undefined;
}

export {};
