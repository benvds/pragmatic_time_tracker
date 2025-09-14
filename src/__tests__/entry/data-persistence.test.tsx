import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

describe("Data Persistence - Integration Tests", () => {
    beforeEach(() => {
        mockLocalStorage.clear();
        mockAlert.mockClear();
    });

    it("T023: should persist multiple entries and maintain data integrity", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        // Add first entry
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const mmInput = screen.getAllByDisplayValue("")[1];
        const submitButton = screen.getByRole("button", { name: /save/i });

        await user.type(descriptionInput, "First task");
        await user.type(projectInput, "Project A");
        await user.type(hhInput, "2");
        await user.type(mmInput, "0");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledTimes(1);
        });

        // Add second entry
        await user.type(descriptionInput, "Second task");
        await user.type(projectInput, "Project B");
        await user.type(hhInput, "1");
        await user.type(mmInput, "30");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledTimes(2);
        });

        // Verify both entries are saved
        const savedData = JSON.parse(mockLocalStorage.getItem("time-tracker-data") || "[]");
        expect(savedData).toHaveLength(2);

        // Verify data integrity
        expect(savedData[0]).toMatchObject({
            description: "Second task",
            project: "Project B",
            duration: 90,
        });
        expect(savedData[1]).toMatchObject({
            description: "First task",
            project: "Project A",
            duration: 120,
        });

        // Verify all entries have required fields
        savedData.forEach(entry => {
            expect(entry).toHaveProperty("id");
            expect(entry).toHaveProperty("date");
            expect(entry).toHaveProperty("createdAt");
            expect(entry).toHaveProperty("updatedAt");
            expect(typeof entry.id).toBe("string");
            expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });
    });

    it("should update existing entry for the same date", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const dateInput = screen.getByLabelText(/date/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Add first entry for specific date
        await user.clear(dateInput);
        await user.type(dateInput, "2024-01-15");
        await user.type(descriptionInput, "Original task");
        await user.type(projectInput, "Project A");
        await user.type(hhInput, "2");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledTimes(1);
        });

        // Add second entry for same date (should update)
        await user.clear(dateInput);
        await user.type(dateInput, "2024-01-15");
        await user.type(descriptionInput, "Updated task");
        await user.type(projectInput, "Project B");
        await user.type(hhInput, "3");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledTimes(2);
        });

        // Verify only one entry exists and it's updated
        const savedData = JSON.parse(mockLocalStorage.getItem("time-tracker-data") || "[]");
        expect(savedData).toHaveLength(1);
        expect(savedData[0]).toMatchObject({
            date: "2024-01-15",
            description: "Updated task",
            project: "Project B",
            duration: 180,
        });
    });

    it("should handle localStorage errors gracefully", async () => {
        const user = userEvent.setup();

        // Mock localStorage to throw error on setItem
        const originalSetItem = mockLocalStorage.setItem;
        mockLocalStorage.setItem = jest.fn(() => {
            throw new Error("Storage quota exceeded");
        });

        render(<EntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        await user.type(descriptionInput, "Test task");
        await user.type(projectInput, "Test Project");
        await user.type(hhInput, "1");
        await user.click(submitButton);

        // Should show error message
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith(
                "Failed to save time entry. Please try again."
            );
        });

        // Restore original setItem
        mockLocalStorage.setItem = originalSetItem;
    });

    it("should load existing data when TimeEntryList component mounts", () => {
        // Pre-populate localStorage with test data
        const testData = [
            {
                id: "test-id-1",
                date: "2024-01-15",
                description: "Existing task",
                project: "Existing Project",
                duration: 120,
                createdAt: "2024-01-15T10:00:00.000Z",
                updatedAt: "2024-01-15T10:00:00.000Z",
            }
        ];
        mockLocalStorage.setItem("time-tracker-data", JSON.stringify(testData));

        render(<TimeEntryList />);

        // Should display the existing entry
        expect(screen.getByText("Existing task")).toBeInTheDocument();
        expect(screen.getByText("Existing Project")).toBeInTheDocument();
        expect(screen.getByText("2h 0m")).toBeInTheDocument();
    });
});
