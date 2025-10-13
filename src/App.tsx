import { useEffect, useState } from "react";
import { MantineProvider } from "@mantine/core";
import { useStore } from "@livestore/react";

import { Logbook } from "@/features";
import { seedDevelopmentData } from "@/features/storage";
import { ErrorBoundary } from "@/features/logbook/components/error-boundary";

export const App = () => {
    const { store } = useStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Only seed in development mode
                if (import.meta.env.DEV) {
                    const result = await seedDevelopmentData(store);

                    if (result.success) {
                        if (result.seeded) {
                            console.log(
                                `✅ Seeded ${result.seeded} development entries`,
                            );
                        } else if (result.skipped) {
                            console.log(
                                `ℹ️ Development data already exists, skipping seed`,
                            );
                        }
                    } else {
                        console.error(
                            "❌ Failed to seed development data:",
                            result.error,
                        );
                    }
                }

                // In production, don't auto-seed - let users choose via EmptyState component
                // Store first-run flag in localStorage to avoid repeated checks
                const hasSeenApp = localStorage.getItem(
                    "time-tracker-initialized",
                );
                if (!hasSeenApp) {
                    localStorage.setItem("time-tracker-initialized", "true");
                    console.log("👋 Welcome to Pragmatic Time Tracker!");
                }
            } catch (error) {
                console.error("❌ App initialization error:", error);
            } finally {
                setIsReady(true);
            }
        };

        initializeApp();
    }, [store]);

    // Show loading state while seeding (only matters in dev)
    if (!isReady) {
        return (
            <MantineProvider>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        fontSize: "18px",
                        color: "#666",
                    }}
                >
                    Loading...
                </div>
            </MantineProvider>
        );
    }

    return (
        <MantineProvider>
            <ErrorBoundary>
                <Logbook />
            </ErrorBoundary>
        </MantineProvider>
    );
};
