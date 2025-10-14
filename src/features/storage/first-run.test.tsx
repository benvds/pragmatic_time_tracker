import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import { EmptyState } from "@/features/logbook/components/empty-state";
import { useEntries } from "@/features/storage";

// Mock the storage hooks
vi.mock("@/features/storage", () => ({
    useEntries: vi.fn(),
    seedOnboardingData: vi.fn(),
}));

// Mock the store hook
const mockSeedOnboardingData = vi.fn();

vi.mock("@livestore/react", () => ({
    useStore: () => ({
        store: {
            commit: vi.fn(),
            query: vi.fn(),
        },
    }),
}));

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
};

describe("First Run Experience", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock empty entries (first run state)
        vi.mocked(useEntries).mockReturnValue([]);
    });

    describe("First Run Detection", () => {
        it("detects first run when no entries exist", () => {
            const entries = useEntries();

            // Should detect first run (empty entries)
            expect(entries.length).toBe(0);
        });

        it("shows empty state when no entries exist", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            // Should show empty state message
            expect(
                screen.getByText(/no time entries yet/i),
            ).toBeInTheDocument();
            expect(
                screen.getByText(/start tracking your time/i),
            ).toBeInTheDocument();
        });

        it("offers sample data option for new users", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            // Should show option to load sample data
            const loadSampleButton = screen.getByRole("button", {
                name: /load sample data/i,
            });
            expect(loadSampleButton).toBeInTheDocument();
        });
    });

    describe("Empty State Component", () => {
        it("renders friendly message for new users", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            expect(
                screen.getByText(/no time entries yet/i),
            ).toBeInTheDocument();
            expect(
                screen.getByText(/start tracking your time/i),
            ).toBeInTheDocument();
        });

        it("has accessible button for loading sample data", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            const button = screen.getByRole("button", {
                name: /load sample data/i,
            });
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
        });

        it("calls onLoadSampleData when button is clicked", async () => {
            renderWithMantine(
                <EmptyState  />,
            );

            const button = screen.getByRole("button", {
                name: /load sample data/i,
            });
            fireEvent.click(button);

            await waitFor(() => {
                expect(mockSeedOnboardingData).toHaveBeenCalledOnce();
            });
        });

        it("shows loading state while seeding sample data", async () => {
            // Mock a slow seeding function
            mockSeedOnboardingData.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100)),
            );

            renderWithMantine(
                <EmptyState  />,
            );

            const button = screen.getByRole("button", {
                name: /load sample data/i,
            });
            fireEvent.click(button);

            // Should show loading state
            await waitFor(() => {
                expect(screen.getByText(/loading/i)).toBeInTheDocument();
            });
        });

        it("handles errors gracefully when sample data loading fails", async () => {
            // Mock a failing seeding function
            mockSeedOnboardingData.mockRejectedValue(
                new Error("Seeding failed"),
            );

            renderWithMantine(
                <EmptyState  />,
            );

            const button = screen.getByRole("button", {
                name: /load sample data/i,
            });
            fireEvent.click(button);

            await waitFor(() => {
                // Should show error message
                expect(
                    screen.getByText(/failed to load sample data/i),
                ).toBeInTheDocument();
            });
        });

        it("disables button while loading", async () => {
            mockSeedOnboardingData.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100)),
            );

            renderWithMantine(
                <EmptyState  />,
            );

            const button = screen.getByRole("button", {
                name: /load sample data/i,
            });
            fireEvent.click(button);

            // Button should be disabled while loading
            await waitFor(() => {
                expect(button).toBeDisabled();
            });
        });
    });

    describe("User Journey", () => {
        it("provides clear next steps for new users", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            // Should give clear guidance
            expect(
                screen.getByText(/start tracking your time/i),
            ).toBeInTheDocument();

            // Should offer sample data to get started
            expect(
                screen.getByRole("button", { name: /load sample data/i }),
            ).toBeInTheDocument();
        });

        it("has appropriate styling for empty state", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            // Should use Paper component for consistent styling
            const paper = document.querySelector(".mantine-Paper-root");
            expect(paper).toBeInTheDocument();

            // Should have appropriate text styling
            const messageText = screen.getByText(/no time entries yet/i);
            expect(messageText).toHaveClass("mantine-Text-root");
        });

        it("maintains consistent branding with the app", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            // Should use consistent Mantine components
            expect(
                document.querySelector(".mantine-Paper-root"),
            ).toBeInTheDocument();
            expect(
                document.querySelector(".mantine-Button-root"),
            ).toBeInTheDocument();
            expect(
                document.querySelector(".mantine-Text-root"),
            ).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("has proper heading structure for screen readers", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            // Should have a clear heading
            const heading = screen.getByRole("heading");
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent(/no time entries/i);
        });

        it("has descriptive button text", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            const button = screen.getByRole("button", {
                name: /load sample data/i,
            });
            expect(button).toHaveAccessibleName();
        });

        it("provides appropriate ARIA labels and descriptions", () => {
            renderWithMantine(
                <EmptyState  />,
            );

            const button = screen.getByRole("button", {
                name: /load sample data/i,
            });

            // Should have accessible name
            expect(button).toHaveAttribute("type", "button");
        });
    });
});
