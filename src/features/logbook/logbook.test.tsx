import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import { Logbook } from "./logbook";
import * as generateEntriesModule from "./util/generate-entries";

// Mock the generate-entries module
vi.mock("./util/generate-entries");

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
};

const mockEntries = [
    {
        date: "Sep 26",
        duration: "2h 30m",
        description: "Code review and feedback",
    },
    {
        date: "Sep 25",
        duration: "4h",
        description: "Feature development - user authentication",
    },
    {
        date: "Sep 24",
        duration: "1h 30m",
        description: undefined, // Test undefined description
    },
    {
        date: "Sep 23",
        duration: "8h",
        description: "API endpoint implementation",
    },
];

describe("Logbook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the generateWorkingDayEntries function
        vi.mocked(
            generateEntriesModule.generateWorkingDayEntries,
        ).mockReturnValue(mockEntries);
    });

    it("renders the logbook title", () => {
        renderWithMantine(<Logbook />);

        expect(
            screen.getByRole("heading", { name: "Time Tracker Logbook" }),
        ).toBeInTheDocument();
    });

    it("renders the table with correct headers", () => {
        renderWithMantine(<Logbook />);

        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(
            screen.getByRole("columnheader", { name: "Date" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("columnheader", { name: "Duration" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("columnheader", { name: "Description" }),
        ).toBeInTheDocument();
    });

    it("displays all entries from generateWorkingDayEntries", () => {
        renderWithMantine(<Logbook />);

        // Check that all mock entries are displayed
        expect(screen.getByText("Sep 26")).toBeInTheDocument();
        expect(screen.getByText("Sep 25")).toBeInTheDocument();
        expect(screen.getByText("Sep 24")).toBeInTheDocument();
        expect(screen.getByText("Sep 23")).toBeInTheDocument();

        expect(screen.getByText("2h 30m")).toBeInTheDocument();
        expect(screen.getByText("4h")).toBeInTheDocument();
        expect(screen.getByText("1h 30m")).toBeInTheDocument();
        expect(screen.getByText("8h")).toBeInTheDocument();
    });

    it("displays entry descriptions correctly", () => {
        renderWithMantine(<Logbook />);

        expect(
            screen.getByText("Code review and feedback"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Feature development - user authentication"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("API endpoint implementation"),
        ).toBeInTheDocument();
    });

    it("displays em dash for undefined descriptions", () => {
        renderWithMantine(<Logbook />);

        // The entry for Sep 24 has undefined description, should show em dash
        const rows = screen.getAllByRole("row");
        const sep24Row = rows.find((row) =>
            row.textContent?.includes("Sep 24"),
        );
        expect(sep24Row).toBeInTheDocument();
        expect(sep24Row?.textContent).toContain("—");
    });

    it("calls generateWorkingDayEntries on render", () => {
        renderWithMantine(<Logbook />);

        expect(
            generateEntriesModule.generateWorkingDayEntries,
        ).toHaveBeenCalledOnce();
    });

    it("renders correct number of data rows", () => {
        renderWithMantine(<Logbook />);

        // Get all rows (including header)
        const allRows = screen.getAllByRole("row");
        // Should have 1 header row + 4 data rows
        expect(allRows).toHaveLength(5);

        // Get only data rows (tbody rows)
        const dataRows = allRows.slice(1); // Skip header row
        expect(dataRows).toHaveLength(4);
    });

    it("handles empty entries array", () => {
        vi.mocked(
            generateEntriesModule.generateWorkingDayEntries,
        ).mockReturnValue([]);

        renderWithMantine(<Logbook />);

        // Should still show headers
        expect(
            screen.getByRole("columnheader", { name: "Date" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("columnheader", { name: "Duration" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("columnheader", { name: "Description" }),
        ).toBeInTheDocument();

        // Should only have header row
        const allRows = screen.getAllByRole("row");
        expect(allRows).toHaveLength(1); // Only header row
    });

    it("applies correct CSS classes to table elements", () => {
        renderWithMantine(<Logbook />);

        const table = screen.getByRole("table");
        expect(table).toHaveClass("mantine-Table-table");

        // Check for custom CSS module classes (they should be present)
        expect(table).toHaveAttribute("class");
        const tableClasses = table.getAttribute("class");
        expect(tableClasses).toMatch(/_table_/); // CSS module hash pattern
    });

    it("applies correct CSS classes to container elements", () => {
        renderWithMantine(<Logbook />);

        // Check for Container component
        const container = document.querySelector(".mantine-Container-root");
        expect(container).toBeInTheDocument();

        // Check for Paper component
        const paper = document.querySelector(".mantine-Paper-root");
        expect(paper).toBeInTheDocument();
    });

    it("renders table with striped and hover attributes", () => {
        renderWithMantine(<Logbook />);

        // Check that table rows have striped and hover attributes
        const firstRow = screen.getAllByRole("row")[1]; // Skip header row
        expect(firstRow).toHaveAttribute("data-striped", "odd");
        expect(firstRow).toHaveAttribute("data-hover", "true");
    });

    it("maintains table structure with thead and tbody", () => {
        renderWithMantine(<Logbook />);

        const table = screen.getByRole("table");
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");

        expect(thead).toBeInTheDocument();
        expect(tbody).toBeInTheDocument();
    });

    it("renders with proper semantic structure", () => {
        renderWithMantine(<Logbook />);

        // Check semantic structure
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
        expect(screen.getByRole("table")).toBeInTheDocument();

        // Check that each data cell has proper content
        const cells = screen.getAllByRole("cell");
        expect(cells.length).toBeGreaterThan(0);
    });

    it("handles large number of entries", () => {
        // Create a large mock dataset
        const largeEntries = Array.from({ length: 50 }, (_, i) => ({
            date: `Sep ${i + 1}`,
            duration: `${Math.floor(Math.random() * 8) + 1}h`,
            description: `Task ${i + 1}`,
        }));

        vi.mocked(
            generateEntriesModule.generateWorkingDayEntries,
        ).mockReturnValue(largeEntries);

        renderWithMantine(<Logbook />);

        // Should render all entries
        const allRows = screen.getAllByRole("row");
        expect(allRows).toHaveLength(51); // 1 header + 50 data rows
    });

    it("preserves entry order from generateWorkingDayEntries", () => {
        renderWithMantine(<Logbook />);

        const rows = screen.getAllByRole("row");
        const dataRows = rows.slice(1); // Skip header

        // Check that entries appear in the same order as mockEntries
        expect(dataRows[0]).toHaveTextContent("Sep 26");
        expect(dataRows[1]).toHaveTextContent("Sep 25");
        expect(dataRows[2]).toHaveTextContent("Sep 24");
        expect(dataRows[3]).toHaveTextContent("Sep 23");
    });

    it("handles special characters in descriptions", () => {
        const entriesWithSpecialChars = [
            {
                date: "Sep 26",
                duration: "2h",
                description: "Fix bug: <script> injection & validation",
            },
            {
                date: "Sep 25",
                duration: "1h",
                description: "Update documentation (API v2.0)",
            },
        ];

        vi.mocked(
            generateEntriesModule.generateWorkingDayEntries,
        ).mockReturnValue(entriesWithSpecialChars);

        renderWithMantine(<Logbook />);

        expect(
            screen.getByText("Fix bug: <script> injection & validation"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Update documentation (API v2.0)"),
        ).toBeInTheDocument();
    });
});
