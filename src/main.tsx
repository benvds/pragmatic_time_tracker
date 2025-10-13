import "@mantine/core/styles.css";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { unstable_batchedUpdates } from "react-dom";

import { LiveStoreProvider } from "@livestore/react";
import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import LiveStoreWorker from "./features/storage/livestore.worker?worker";
import { schema } from "./features/storage/schema";

import { App } from "./App";

// Create LiveStore adapter with OPFS storage
const adapter = makePersistedAdapter({
    storage: { type: "opfs" },
    worker: LiveStoreWorker,
    sharedWorker: LiveStoreSharedWorker,
});

createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <LiveStoreProvider
            adapter={adapter}
            schema={schema}
            batchUpdates={unstable_batchedUpdates}
        >
            <App />
        </LiveStoreProvider>
    </StrictMode>,
);
