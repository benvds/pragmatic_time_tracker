import { type FormEventHandler } from "react";

import { Button } from "@/components/button";
import type { TimeEntry } from "@/features/entry/types";
import {
    everyFieldOk,
    FieldError,
    parseDate,
    type FieldParser,
    useForm,
} from "@/lib/form";

import styles from "./index.module.css";

// LocalStorage key for time entries
const STORAGE_KEY = "time-tracker-data";

// UUID v4 generator
function generateId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        },
    );
}

// localStorage service functions
const timeEntryStorage = {
    getAll(): TimeEntry[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error(
                "Failed to load time entries from localStorage:",
                error,
            );
            return [];
        }
    },

    save(entries: TimeEntry[]): boolean {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            return true;
        } catch (error) {
            console.error(
                "Failed to save time entries to localStorage:",
                error,
            );
            return false;
        }
    },

    add(entryData: {
        date: string;
        description: string;
        project: string;
        duration: number;
    }): TimeEntry | null {
        try {
            const entries = this.getAll();

            // Check if entry for this date already exists
            const existingIndex = entries.findIndex(
                (entry) => entry.date === entryData.date,
            );

            const now = new Date().toISOString();
            const newEntry: TimeEntry = {
                id: generateId(),
                date: entryData.date,
                description: entryData.description,
                project: entryData.project,
                duration: entryData.duration,
                createdAt: now,
                updatedAt: now,
            };

            if (existingIndex >= 0) {
                // Update existing entry
                newEntry.id = entries[existingIndex].id;
                newEntry.createdAt = entries[existingIndex].createdAt;
                entries[existingIndex] = newEntry;
            } else {
                // Add new entry
                entries.push(newEntry);
            }

            // Sort by date (newest first)
            entries.sort(
                (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
            );

            return this.save(entries) ? newEntry : null;
        } catch (error) {
            console.error("Failed to add time entry:", error);
            return null;
        }
    },

    existsForDate(date: string): boolean {
        const entries = this.getAll();
        return entries.some((entry) => entry.date === date);
    },
};

const descriptionMinLength = 3;
const projectMinLength = 2;
const hhMin = 0;
const hhMax = 24;
const mmMin = 0;
const mmMax = 59;

const parseDescription: FieldParser<string> = (input) => {
    if (input === null || input.length === 0) {
        return { value: undefined, error: `Required` };
    } else if (input.length < descriptionMinLength) {
        return {
            value: undefined,
            error: `At least ${descriptionMinLength} characters needed`,
        };
    } else {
        return { value: input };
    }
};

const parseProject: FieldParser<string> = (input) => {
    if (input === null || input.length === 0) {
        return { value: undefined, error: `Required` };
    } else if (input.length < projectMinLength) {
        return {
            value: undefined,
            error: `At least ${projectMinLength} characters needed`,
        };
    } else {
        return { value: input };
    }
};

const parseHh: FieldParser<number> = (input) => {
    const parsed = Number.parseInt(input ?? "");

    if (Number.isNaN(parsed) || parsed < hhMin || parsed > hhMax) {
        return {
            value: undefined,
            error: `Should be a number between ${hhMin} and ${hhMax}.`,
        };
    } else {
        return { value: parsed };
    }
};

const parseMm: FieldParser<number> = (input) => {
    const parsed = Number.parseInt(input ?? "");

    if (Number.isNaN(parsed) || parsed < mmMin || parsed > mmMax) {
        return {
            value: undefined,
            error: `Should be a number between ${mmMin} and ${mmMax}.`,
        };
    } else {
        return { value: parsed };
    }
};

const fieldParsers = {
    date: parseDate,
    description: parseDescription,
    project: parseProject,
    hh: parseHh,
    mm: parseMm,
};

export const EntryForm = () => {
    // Set today's date as default
    const today = new Date().toISOString().split("T")[0];
    const { fields, reset, setField, setFields } = useForm({
        parsers: fieldParsers,
        initial: {
            date: { value: today },
        },
    });

    const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault();

        const parsed = setFields(evt);

        if (everyFieldOk(parsed)) {
            const entryData = {
                date: parsed.date.value,
                description: parsed.description.value,
                project: parsed.project.value,
                duration: parsed.hh.value * 60 + parsed.mm.value,
            };

            // Save to localStorage
            const savedEntry = timeEntryStorage.add(entryData);

            if (savedEntry) {
                console.log("Time entry saved:", savedEntry);

                // Dispatch custom event to notify other components
                window.dispatchEvent(new CustomEvent("timeEntryUpdated"));

                // Show success feedback (you could replace this with a toast notification later)
                alert(`Time entry saved successfully!
Date: ${savedEntry.date}
Project: ${savedEntry.project}
Duration: ${Math.floor(savedEntry.duration / 60)}h ${savedEntry.duration % 60}m`);

                // Reset form after successful save
                reset();

                // Set today's date again after reset
                setTimeout(() => {
                    const dateInput = document.querySelector(
                        'input[name="date"]',
                    ) as HTMLInputElement;
                    if (dateInput) {
                        dateInput.value = new Date()
                            .toISOString()
                            .split("T")[0];
                    }
                }, 0);
            } else {
                // Show error feedback
                alert("Failed to save time entry. Please try again.");
            }
        }
    };

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
            onReset={reset}
            noValidate
        >
            <div className={styles.formField}>
                <label htmlFor="date">Date</label>
                <input
                    type="date"
                    name="date"
                    tabIndex={0}
                    defaultValue={today}
                    onBlur={setField("date")}
                />
                <FieldError field={fields.date} />
            </div>
            <div className={styles.formField}>
                <label htmlFor="description">Description</label>
                <input
                    type="text"
                    name="description"
                    tabIndex={0}
                    onBlur={setField("description")}
                />
                <FieldError field={fields.description} />
            </div>
            <div className={styles.formField}>
                <label htmlFor="project">Project</label>
                <input
                    type="text"
                    name="project"
                    tabIndex={0}
                    onBlur={setField("project")}
                />
                <FieldError field={fields.project} />
            </div>
            <div className={styles.formField}>
                <label htmlFor="hh">Duration (hh:mm)</label>
                <div className={styles.inputGroup}>
                    <div>
                        <input
                            className={styles.doubleDigits}
                            type="number"
                            name="hh"
                            tabIndex={0}
                            min={hhMin}
                            max={hhMax}
                            onBlur={setField("hh")}
                        />
                        <FieldError field={fields.hh} />
                    </div>
                    <div>
                        <input
                            className={styles.doubleDigits}
                            type="number"
                            name="mm"
                            tabIndex={0}
                            min={mmMin}
                            max={mmMax}
                            onBlur={setField("mm")}
                        />
                        <FieldError field={fields.mm} />
                    </div>
                </div>
            </div>
            <div className={styles.formActions}>
                <Button type="submit">Save</Button>
                <Button variant="ghost" type="reset">
                    Reset
                </Button>
            </div>
        </form>
    );
};
