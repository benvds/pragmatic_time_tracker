import { events } from "../schema";

/**
 * Development seed data - realistic sample data for development
 *
 * Characteristics:
 * - 15-20 entries spanning last 7 days
 * - Varied durations (30 min to 8 hours)
 * - Realistic work descriptions
 * - No deleted entries
 * - Deterministic IDs (dev-1, dev-2, etc.)
 */
export const developmentSeedData = [
    // 7 days ago
    events.entryCreated({
        id: "dev-1",
        date: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000,
        ), // 9 AM, 7 days ago
        minutes: 120,
        description: "Morning standup and sprint planning",
    }),
    events.entryCreated({
        id: "dev-2",
        date: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000,
        ), // 1 PM, 7 days ago
        minutes: 240,
        description: "Feature development - user authentication system",
    }),

    // 6 days ago
    events.entryCreated({
        id: "dev-3",
        date: new Date(
            Date.now() - 6 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000,
        ), // 10 AM, 6 days ago
        minutes: 90,
        description: "Code review and feedback sessions",
    }),
    events.entryCreated({
        id: "dev-4",
        date: new Date(
            Date.now() - 6 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000,
        ), // 2 PM, 6 days ago
        minutes: 180,
        description: "Bug fixes in payment processing module",
    }),

    // 5 days ago
    events.entryCreated({
        id: "dev-5",
        date: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000,
        ), // 9 AM, 5 days ago
        minutes: 60,
        description: "Team meeting - quarterly planning",
    }),
    events.entryCreated({
        id: "dev-6",
        date: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000,
        ), // 11 AM, 5 days ago
        minutes: 300,
        description: "Database optimization and query performance tuning",
    }),
    events.entryCreated({
        id: "dev-7",
        date: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000,
        ), // 4 PM, 5 days ago
        minutes: 90,
        description: "Documentation updates for API endpoints",
    }),

    // 4 days ago
    events.entryCreated({
        id: "dev-8",
        date: new Date(
            Date.now() - 4 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
        ), // 8 AM, 4 days ago
        minutes: 150,
        description: "Implementation of notification system",
    }),
    events.entryCreated({
        id: "dev-9",
        date: new Date(
            Date.now() - 4 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000,
        ), // 1 PM, 4 days ago
        minutes: 210,
        description: "Unit testing and coverage improvements",
    }),

    // 3 days ago
    events.entryCreated({
        id: "dev-10",
        date: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000,
        ), // 10 AM, 3 days ago
        minutes: 120,
        description: "Client requirements analysis and wireframing",
    }),
    events.entryCreated({
        id: "dev-11",
        date: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000,
        ), // 3 PM, 3 days ago
        minutes: 180,
        description: "UI component development and styling",
    }),

    // 2 days ago
    events.entryCreated({
        id: "dev-12",
        date: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000,
        ), // 9 AM, 2 days ago
        minutes: 45,
        description: "Security audit review and vulnerability assessment",
    }),
    events.entryCreated({
        id: "dev-13",
        date: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000,
        ), // 11 AM, 2 days ago
        minutes: 240,
        description: "Deployment pipeline setup and CI/CD configuration",
    }),
    events.entryCreated({
        id: "dev-14",
        date: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000,
        ), // 4 PM, 2 days ago
        minutes: 60,
        description: "Performance monitoring setup and alerting",
    }),

    // Yesterday
    events.entryCreated({
        id: "dev-15",
        date: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
        ), // 8 AM, yesterday
        minutes: 90,
        description: "Third-party API integration and error handling",
    }),
    events.entryCreated({
        id: "dev-16",
        date: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000,
        ), // 12 PM, yesterday
        minutes: 180,
        description: "Mobile responsive design improvements",
    }),
    events.entryCreated({
        id: "dev-17",
        date: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000,
        ), // 3 PM, yesterday
        minutes: 120,
        description: "Accessibility improvements and WCAG compliance",
    }),

    // Today (if it's not a weekend)
    ...(new Date().getDay() !== 0 && new Date().getDay() !== 6
        ? [
              events.entryCreated({
                  id: "dev-18",
                  date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                  minutes: 90,
                  description: "Daily standup and task prioritization",
              }),
          ]
        : []),
];

/**
 * Test seed data - edge cases and boundary conditions for testing
 *
 * Characteristics:
 * - 8-10 entries total
 * - Includes edge cases: empty description, min/max durations
 * - Includes deleted entries
 * - Boundary dates
 * - Deterministic IDs for test assertions
 */
export const testSeedData = [
    // Edge case: Minimal duration (1 minute)
    events.entryCreated({
        id: "test-edge-1",
        date: new Date("2025-01-01T09:00:00"),
        minutes: 1,
        description: "",
    }),

    // Edge case: Maximum single-day duration (24 hours)
    events.entryCreated({
        id: "test-edge-2",
        date: new Date("2025-12-31T00:00:00"),
        minutes: 1440,
        description: "X".repeat(1000), // Long description
    }),

    // Normal entry for comparison
    events.entryCreated({
        id: "test-edge-3",
        date: new Date("2025-06-15T12:00:00"),
        minutes: 120,
        description: "Normal test entry for comparison",
    }),

    // Edge case: Very short description
    events.entryCreated({
        id: "test-edge-4",
        date: new Date("2025-03-01T08:00:00"),
        minutes: 30,
        description: "Short",
    }),

    // Entry to be deleted (test soft delete)
    events.entryCreated({
        id: "test-deleted-1",
        date: new Date("2025-02-14T10:00:00"),
        minutes: 60,
        description: "Entry that will be deleted",
    }),

    // Another entry to be deleted
    events.entryCreated({
        id: "test-deleted-2",
        date: new Date("2025-04-01T14:00:00"),
        minutes: 240,
        description: "Another entry for deletion testing",
    }),

    // Edge case: Weekend entry
    events.entryCreated({
        id: "test-edge-5",
        date: new Date("2025-05-03T16:00:00"), // Saturday
        minutes: 480, // 8 hours
        description: "Weekend work session",
    }),

    // Delete events (soft delete the entries created above)
    events.entryDeleted({
        id: "test-deleted-1",
        deletedAt: new Date("2025-02-15T09:00:00"),
    }),

    events.entryDeleted({
        id: "test-deleted-2",
        deletedAt: new Date("2025-04-02T10:00:00"),
    }),

    // Edge case: Entry with special characters in description
    events.entryCreated({
        id: "test-edge-6",
        date: new Date("2025-07-04T11:00:00"),
        minutes: 90,
        description: "Testing special chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
    }),
];

/**
 * Onboarding seed data - simple examples for new users
 *
 * Characteristics:
 * - 3-5 entries
 * - Clear, tutorial-style descriptions
 * - Demonstrates basic features
 * - Recent dates
 */
export const onboardingSeedData = [
    events.entryCreated({
        id: "onboard-1",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        minutes: 30,
        description: "Welcome! This is your first time entry",
    }),

    events.entryCreated({
        id: "onboard-2",
        date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        minutes: 60,
        description: "You can track any work activity here",
    }),

    events.entryCreated({
        id: "onboard-3",
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        minutes: 45,
        description: "Time entries help you understand how you spend your day",
    }),

    events.entryCreated({
        id: "onboard-4",
        date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        minutes: 90,
        description: "You can edit or delete entries by clicking on them",
    }),
];
