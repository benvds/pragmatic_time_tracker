interface LogEntry {
    date: string;
    duration: string;
    description?: string;
}

const taskDescriptions = [
    "Code review and feedback",
    "Feature development - user authentication",
    "Bug fixes in payment system",
    "Meeting with design team",
    "Database optimization work",
    "API endpoint implementation",
    "Unit testing and coverage",
    "Documentation updates",
    "Performance monitoring setup",
    "Client requirements analysis",
    "UI component development",
    "Security audit review",
    "Deployment pipeline setup",
    "Sprint planning meeting",
    "Refactoring legacy code",
    "Third-party integration",
    "Error handling improvements",
    "Mobile responsive fixes",
    "Accessibility improvements",
    "Team standup meeting",
];

function getRandomDuration(): string {
    const hours = Math.floor(Math.random() * 8) + 1; // 1-8 hours
    const minutes =
        Math.random() < 0.7 ? Math.floor(Math.random() * 4) * 15 : 0; // 0, 15, 30, or 45 minutes

    if (hours === 0) {
        return `${minutes}m`;
    } else if (minutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${minutes}m`;
    }
}

function getRandomDescription(): string | undefined {
    // 20% chance of no description
    if (Math.random() < 0.2) {
        return undefined;
    }

    return taskDescriptions[
        Math.floor(Math.random() * taskDescriptions.length)
    ];
}

function isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
}

export function generateWorkingDayEntries(): LogEntry[] {
    const entries: LogEntry[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Start from the first day of the current month
    const startDate = new Date(currentYear, currentMonth, 1);

    // Generate entries up to today (or end of month if we're past it)
    const endDate = new Date(
        Math.min(
            today.getTime(),
            new Date(currentYear, currentMonth + 1, 0).getTime(),
        ),
    );

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        if (isWorkingDay(currentDate)) {
            // Skip today (that's where the form will be)
            if (currentDate.toDateString() !== today.toDateString()) {
                entries.push({
                    date: currentDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    }),
                    duration: getRandomDuration(),
                    description: getRandomDescription(),
                });
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Return entries in reverse chronological order (most recent first, after the form)
    return entries.reverse();
}
