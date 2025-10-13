import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import { Logbook } from "./logbook";

// Mock the storage hooks
vi.mock("@/features/storage", () => ({
    useEntries: vi.fn(),
    seedOnboardingData: vi.fn(),
}));

// Mock the LiveStore hooks
vi.mock("@livestore/react", () => ({
    useStore: vi.fn(() => ({
        store: {
            commit: vi.fn(),
        },
    })),
}));

import { useEntries } from "@/features/storage";

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
};

const mockEntries = [
    {
        id: "entry-1",
        date: new Date("2025-09-26T09:00:00"),
        minutes: 150, // 2h 30m
        description: "Code review and feedback",
        deletedAt: null,
    },
    {
        id: "entry-2",
        date: new Date("2025-09-25T10:00:00"),
        minutes: 240, // 4h
        description: "Feature development - user authentication",
        deletedAt: null,
    },
    {
        id: "entry-3",
        date: new Date("2025-09-24T11:00:00"),
        minutes: 90, // 1h 30m
        description: "", // Test empty description
        deletedAt: null,
    },
    {
        id: "entry-4",
        date: new Date("2025-09-23T08:00:00"),
        minutes: 480, // 8h
        description: "API endpoint implementation",
        deletedAt: null,
    },
];

describe("Logbook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the useEntries hook
        vi.mocked(useEntries).mockReturnValue(mockEntries);
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

    it("displays all entries from useEntries hook", () => {
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

    it("displays em dash for empty descriptions", () => {
        renderWithMantine(<Logbook />);

        // The entry for Sep 24 has empty description, should show em dash
        const rows = screen.getAllByRole("row");
        const sep24Row = rows.find((row) =>
            row.textContent?.includes("Sep 24"),
        );
        expect(sep24Row).toBeInTheDocument();
        expect(sep24Row?.textContent).toContain("—");
    });

    it("calls useEntries hook on render", () => {
        renderWithMantine(<Logbook />);

        expect(useEntries).toHaveBeenCalledOnce();
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
        vi.mocked(useEntries).mockReturnValue([]);

        renderWithMantine(<Logbook />);

        // Should show empty state component instead of table
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        expect(screen.getByText("No time entries yet")).toBeInTheDocument();
        expect(screen.getByText("Start tracking your time! Your entries will appear here once you begin logging your work.")).toBeInTheDocument();

        // Should show load sample data button
        expect(screen.getByRole("button", { name: "Load Sample Data" })).toBeInTheDocument();

        // Should NOT show table headers when empty
        expect(screen.queryByRole("columnheader", { name: "Date" })).not.toBeInTheDocument();
        expect(screen.queryByRole("columnheader", { name: "Duration" })).not.toBeInTheDocument();
        expect(screen.queryByRole("columnheader", { name: "Description" })).not.toBeInTheDocument();
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
            id: `entry-${i + 1}`,
            date: new Date(`2025-09-${(i % 30) + 1}T09:00:00`),
            minutes: Math.floor(Math.random() * 480) + 60, // 1-8 hours
            description: `Task ${i + 1}`,
            deletedAt: null,
        }));

        vi.mocked(useEntries).mockReturnValue(largeEntries);

        renderWithMantine(<Logbook />);

        // Should render all entries
        const allRows = screen.getAllByRole("row");
        expect(allRows).toHaveLength(51); // 1 header + 50 data rows
    });

    it("preserves entry order from useEntries hook", () => {
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
                id: "special-1",
                date: new Date("2025-09-26T09:00:00"),
                minutes: 120,
                description: "Fix bug: <script> injection & validation",
                deletedAt: null,
            },
            {
                id: "special-2",
                date: new Date("2025-09-25T10:00:00"),
                minutes: 60,
                description: "Update documentation (API v2.0)",
                deletedAt: null,
            },
        ];

        vi.mocked(useEntries).mockReturnValue(entriesWithSpecialChars);

        renderWithMantine(<Logbook />);

        expect(
            screen.getByText("Fix bug: <script> injection & validation"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Update documentation (API v2.0)"),
        ).toBeInTheDocument();
    });
});
