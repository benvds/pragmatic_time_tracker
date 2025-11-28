import { MantineProvider } from "@mantine/core";

import { Logbook } from "@/features";
import { ErrorBoundary } from "@/features/logbook/components/error-boundary";
import { DebugOverlay } from "@/components/debug-overlay";

export const App = () => (
    <MantineProvider>
        <ErrorBoundary>
            <Logbook />
            <DebugOverlay />
        </ErrorBoundary>
    </MantineProvider>
);
