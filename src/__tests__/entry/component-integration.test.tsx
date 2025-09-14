import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { App } from "@/App";
import { EntryForm, TimeEntryList } from "@/features/entry";

// Mock localStorage
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
});

// Mock alert
const mockAlert = jest.fn();
Object.defineProperty(window, "alert", {
    value: mockAlert,
});

describe("Component Integration - Integration Tests", () => {
    beforeEach(() => {
        mockLocalStorage.clear();
        mockAlert.mockClear();
    });

    it("T025: should integrate EntryForm and TimeEntryList through custom events", async () => {
        const user = userEvent.setup();

        render(<App />);

        // Initially, TimeEntryList should be empty
        expect(screen.queryByText("No time entries yet")).toBeInTheDocument();

        // Fill and submit form
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        await user.type(descriptionInput, "Integration test task");
        await user.type(projectInput, "Test Project");
        await user.type(hhInput, "2");
        await user.click(submitButton);

        // Wait for success alert
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith(
                expect.stringContaining("Time entry saved successfully!")
            );
        });

        // TimeEntryList should now display the new entry
        await waitFor(() => {
            expect(screen.getByText("Integration test task")).toBeInTheDocument();
            expect(screen.getByText("Test Project")).toBeInTheDocument();
            expect(screen.getByText("2h 0m")).toBeInTheDocument();
        });

        // "No entries" message should be gone
        expect(screen.queryByText("No time entries yet")).not.toBeInTheDocument();
    });

    it("should update TimeEntryList when multiple entries are added", async () => {
        const user = userEvent.setup();

        render(<App />);

        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Add first entry
        await user.type(descriptionInput, "First task");
        await user.type(projectInput, "Project A");
        await user.type(hhInput, "1");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledTimes(1);
        });

        // Add second entry
        await user.type(descriptionInput, "Second task");
        await user.type(projectInput, "Project B");
        await user.type(hhInput, "2");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledTimes(2);
        });

        // Both entries should be visible in TimeEntryList (newest first)
        await waitFor(() => {
            expect(screen.getByText("Second task")).toBeInTheDocument();
            expect(screen.getByText("First task")).toBeInTheDocument();
            expect(screen.getByText("Project A")).toBeInTheDocument();
            expect(screen.getByText("Project B")).toBeInTheDocument();
        });

        // Should have two time entry cards
        const timeEntryCards = screen.getAllByText(/\d+h \d+m/);
        expect(timeEntryCards).toHaveLength(2);
    });

    it("should handle entry deletion and update display", async () => {
        const user = userEvent.setup();

        render(<App />);

        // Add an entry first
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        await user.type(descriptionInput, "Task to delete");
        await user.type(projectInput, "Test Project");
        await user.type(hhInput, "1");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Task to delete")).toBeInTheDocument();
        });

        // Find and click delete button
        const deleteButton = screen.getByRole("button", { name: /delete/i });
        await user.click(deleteButton);

        // Entry should be removed from display
        await waitFor(() => {
            expect(screen.queryByText("Task to delete")).not.toBeInTheDocument();
            expect(screen.getByText("No time entries yet")).toBeInTheDocument();
        });
    });

    it("should handle form reset and not affect TimeEntryList", async () => {
        const user = userEvent.setup();

        render(<App />);

        // Add an entry first
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });
        const resetButton = screen.getByRole("button", { name: /reset/i });

        await user.type(descriptionInput, "Saved task");
        await user.type(projectInput, "Test Project");
        await user.type(hhInput, "1");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Saved task")).toBeInTheDocument();
        });

        // Fill form again but reset instead of submit
        await user.type(descriptionInput, "Reset this");
        await user.type(projectInput, "Reset Project");
        await user.type(hhInput, "2");
        await user.click(resetButton);

        // Form should be cleared
        await waitFor(() => {
            expect(descriptionInput).toHaveValue("");
            expect(projectInput).toHaveValue("");
            expect(hhInput).toHaveValue("");
        });

        // TimeEntryList should still show the saved entry
        expect(screen.getByText("Saved task")).toBeInTheDocument();
        expect(screen.queryByText("Reset this")).not.toBeInTheDocument();
    });

    it("should maintain data consistency between form and list components", async () => {
        const user = userEvent.setup();

        // Pre-populate localStorage with existing data
        const existingData = [
            {
                id: "existing-id",
                date: "2024-01-10",
                description: "Existing task",
                project: "Existing Project",
                duration: 90,
                createdAt: "2024-01-10T10:00:00.000Z",
                updatedAt: "2024-01-10T10:00:00.000Z",
            }
        ];
        mockLocalStorage.setItem("time-tracker-data", JSON.stringify(existingData));

        render(<App />);

        // Should load and display existing data
        expect(screen.getByText("Existing task")).toBeInTheDocument();

        // Add new entry
        const dateInput = screen.getByLabelText(/date/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        await user.clear(dateInput);
        await user.type(dateInput, "2024-01-15");
        await user.type(descriptionInput, "New task");
        await user.type(projectInput, "New Project");
        await user.type(hhInput, "2");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalled();
        });

        // Both entries should be visible
        await waitFor(() => {
            expect(screen.getByText("Existing task")).toBeInTheDocument();
            expect(screen.getByText("New task")).toBeInTheDocument();
        });

        // Verify localStorage contains both entries
        const updatedData = JSON.parse(mockLocalStorage.getItem("time-tracker-data") || "[]");
        expect(updatedData).toHaveLength(2);
    });

    it("should handle localStorage errors gracefully without breaking UI", async () => {
        const user = userEvent.setup();

        // Mock localStorage to throw error on getItem
        const originalGetItem = mockLocalStorage.getItem;
        mockLocalStorage.getItem = jest.fn(() => {
            throw new Error("LocalStorage error");
        });

        // Should render without crashing
        render(<App />);

        // TimeEntryList should handle the error and show empty state
        expect(screen.getByText("No time entries yet")).toBeInTheDocument();

        // Form should still be functional
        const descriptionInput = screen.getByLabelText(/description/i);
        expect(descriptionInput).toBeInTheDocument();

        // Restore original getItem
        mockLocalStorage.getItem = originalGetItem;
    });
});
