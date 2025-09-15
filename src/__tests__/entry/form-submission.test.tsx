import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { EntryForm } from "@/features/entry";

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

// Mock alert to avoid browser dialogs during tests
const mockAlert = vi.fn();
Object.defineProperty(window, "alert", {
    value: mockAlert,
});

describe("EntryForm - Integration Tests", () => {
    beforeEach(() => {
        mockLocalStorage.clear();
        mockAlert.mockClear();
    });

    it("T022: should submit form with valid data and save to localStorage", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        // Find form fields
        const dateInput = screen.getByLabelText(/date/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByRole("spinbutton", { name: /hh/i });
        const mmInput = screen.getByRole("spinbutton", { name: /mm/i });
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Fill in form with valid data
        await user.clear(dateInput);
        await user.type(dateInput, "2024-01-15");

        await user.type(descriptionInput, "Test task description");
        await user.type(projectInput, "Test Project");
        await user.type(hhInput, "2");
        await user.type(mmInput, "30");

        // Submit form
        await user.click(submitButton);

        // Wait for localStorage to be updated
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith(
                expect.stringContaining("Time entry saved successfully!"),
            );
        });

        // Verify data was saved to localStorage
        const savedData = JSON.parse(
            mockLocalStorage.getItem("time-tracker-data") || "[]",
        );
        expect(savedData).toHaveLength(1);
        expect(savedData[0]).toMatchObject({
            date: "2024-01-15",
            description: "Test task description",
            project: "Test Project",
            duration: 150, // 2 hours 30 minutes = 150 minutes
        });
        expect(savedData[0]).toHaveProperty("id");
        expect(savedData[0]).toHaveProperty("createdAt");
        expect(savedData[0]).toHaveProperty("updatedAt");
    });

    it("should dispatch custom event when form is submitted successfully", async () => {
        const user = userEvent.setup();
        const eventListener = vi.fn();

        window.addEventListener("timeEntryUpdated", eventListener);

        render(<EntryForm />);

        // Fill in form with valid data
        const dateInput = screen.getByLabelText(/date/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const mmInput = screen.getAllByDisplayValue("")[1];
        const submitButton = screen.getByRole("button", { name: /save/i });

        await user.clear(dateInput);
        await user.type(dateInput, "2024-01-15");
        await user.type(descriptionInput, "Test task");
        await user.type(projectInput, "Test Project");
        await user.type(hhInput, "1");
        await user.type(mmInput, "0");

        // Submit form
        await user.click(submitButton);

        // Wait for custom event to be dispatched
        await waitFor(() => {
            expect(eventListener).toHaveBeenCalledWith(
                expect.objectContaining({ type: "timeEntryUpdated" }),
            );
        });

        window.removeEventListener("timeEntryUpdated", eventListener);
    });

    it("should reset form after successful submission", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        // Fill in form
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        await user.type(descriptionInput, "Test task");
        await user.type(projectInput, "Test Project");
        await user.type(hhInput, "1");

        // Submit form
        await user.click(submitButton);

        // Wait for form reset
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalled();
        });

        // Verify form fields are cleared (except date which gets reset to today)
        await waitFor(() => {
            expect(descriptionInput).toHaveValue("");
            expect(projectInput).toHaveValue("");
            expect(hhInput).toHaveValue("");
        });
    });
});
