import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

// Mock alert
const mockAlert = jest.fn();
Object.defineProperty(window, "alert", {
    value: mockAlert,
});

describe("Form Validation - Integration Tests", () => {
    beforeEach(() => {
        mockLocalStorage.clear();
        mockAlert.mockClear();
    });

    it("T024: should validate required fields and show error messages", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const submitButton = screen.getByRole("button", { name: /save/i });

        // Try to submit without filling required fields
        await user.click(submitButton);

        // Should show validation errors
        await waitFor(() => {
            expect(screen.getByText("Required")).toBeInTheDocument();
        });

        // Should not save to localStorage or show success alert
        expect(mockAlert).not.toHaveBeenCalled();
        expect(mockLocalStorage.getItem("time-tracker-data")).toBeNull();
    });

    it("should validate description minimum length", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Fill in form with too short description
        await user.type(descriptionInput, "ab"); // Only 2 characters, minimum is 3
        await user.type(projectInput, "Valid Project");
        await user.type(hhInput, "1");

        // Blur description field to trigger validation
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("At least 3 characters needed")).toBeInTheDocument();
        });

        // Try to submit - should not succeed
        await user.click(submitButton);
        expect(mockAlert).not.toHaveBeenCalled();
    });

    it("should validate project minimum length", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Fill in form with too short project name
        await user.type(descriptionInput, "Valid description");
        await user.type(projectInput, "a"); // Only 1 character, minimum is 2
        await user.type(hhInput, "1");

        // Blur project field to trigger validation
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("At least 2 characters needed")).toBeInTheDocument();
        });

        // Try to submit - should not succeed
        await user.click(submitButton);
        expect(mockAlert).not.toHaveBeenCalled();
    });

    it("should validate hour field range", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Test hours too high
        await user.type(descriptionInput, "Valid description");
        await user.type(projectInput, "Valid Project");
        await user.type(hhInput, "25"); // Above max of 24

        // Blur hour field to trigger validation
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("Should be a number between 0 and 24.")).toBeInTheDocument();
        });

        // Try to submit - should not succeed
        await user.click(submitButton);
        expect(mockAlert).not.toHaveBeenCalled();

        // Test negative hours
        await user.clear(hhInput);
        await user.type(hhInput, "-1");
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("Should be a number between 0 and 24.")).toBeInTheDocument();
        });
    });

    it("should validate minute field range", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const mmInput = screen.getAllByDisplayValue("")[1]; // Second empty input is minutes
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Fill valid fields first
        await user.type(descriptionInput, "Valid description");
        await user.type(projectInput, "Valid Project");
        await user.type(hhInput, "2");

        // Test minutes too high
        await user.type(mmInput, "60"); // Above max of 59
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("Should be a number between 0 and 59.")).toBeInTheDocument();
        });

        // Try to submit - should not succeed
        await user.click(submitButton);
        expect(mockAlert).not.toHaveBeenCalled();
    });

    it("should validate date field", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const dateInput = screen.getByLabelText(/date/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Test future date (should be prevented)
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const futureDateString = futureDate.toISOString().split('T')[0];

        await user.clear(dateInput);
        await user.type(dateInput, futureDateString);
        await user.type(descriptionInput, "Valid description");
        await user.type(projectInput, "Valid Project");
        await user.type(hhInput, "1");

        // Blur date field to trigger validation
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText("Date cannot be in the future")).toBeInTheDocument();
        });

        // Try to submit - should not succeed
        await user.click(submitButton);
        expect(mockAlert).not.toHaveBeenCalled();
    });

    it("should allow form submission when all validations pass", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        const projectInput = screen.getByLabelText(/project/i);
        const hhInput = screen.getByDisplayValue("");
        const mmInput = screen.getAllByDisplayValue("")[1];
        const submitButton = screen.getByRole("button", { name: /save/i });

        // Fill in form with all valid data
        await user.type(descriptionInput, "Valid task description");
        await user.type(projectInput, "Valid Project Name");
        await user.type(hhInput, "2");
        await user.type(mmInput, "30");

        // Submit form
        await user.click(submitButton);

        // Should show success message
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith(
                expect.stringContaining("Time entry saved successfully!")
            );
        });

        // Should save to localStorage
        const savedData = JSON.parse(mockLocalStorage.getItem("time-tracker-data") || "[]");
        expect(savedData).toHaveLength(1);
    });

    it("should clear validation errors when user corrects input", async () => {
        const user = userEvent.setup();

        render(<EntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);

        // Enter invalid input
        await user.type(descriptionInput, "ab");
        await user.tab();

        // Should show error
        await waitFor(() => {
            expect(screen.getByText("At least 3 characters needed")).toBeInTheDocument();
        });

        // Correct the input
        await user.type(descriptionInput, "c"); // Now "abc" which is valid

        // Error should be cleared when field is valid
        await user.tab();
        await waitFor(() => {
            expect(screen.queryByText("At least 3 characters needed")).not.toBeInTheDocument();
        });
    });
});
