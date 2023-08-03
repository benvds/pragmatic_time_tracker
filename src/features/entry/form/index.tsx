import {
    ChangeEvent,
    Dispatch,
    FocusEvent,
    FormEvent,
    FormEventHandler,
    SetStateAction,
    useState,
} from "react";

import { Button } from "@/components/button";
import {
    everyFieldOk,
    Field,
    FieldError,
    type FieldParser,
    type FieldParsers,
    type Fields,
    type OkField,
    useForm,
} from "@/lib/form";

import styles from "./index.module.css";

const entryFieldNames = ["description", "project", "hh", "mm"] as const;
type EntryFieldName = (typeof entryFieldNames)[number];
type EntryFields = Fields<EntryFieldName>;

const descriptionMinLength = 3;
const projectMinLength = 2;
const hhMin = 0;
const hhMax = 24;
const mmMin = 0;
const mmMax = 59;

const parseDescription: FieldParser<string> = (input) => {
    if (input === null || input.length === 0) {
        return { error: `Required` };
    } else if (input.length < descriptionMinLength) {
        return { error: `At least ${descriptionMinLength} characters needed` };
    } else {
        return { value: input };
    }
};

const parseProject: FieldParser<string> = (input) => {
    if (input === null || input.length === 0) {
        return { error: `Required` };
    } else if (input.length < projectMinLength) {
        return { error: `At least ${projectMinLength} characters needed` };
    } else {
        return { value: input };
    }
};

const parseHh: FieldParser<number> = (input) => {
    const parsed = Number.parseInt(input ?? "");

    if (Number.isNaN(parsed) || parsed < hhMin || parsed > hhMax) {
        return { error: `Should be a number between ${hhMin} and ${hhMax}.` };
    } else {
        return { value: parsed };
    }
};

const parseMm: FieldParser<number> = (input) => {
    const parsed = Number.parseInt(input ?? "");

    if (Number.isNaN(parsed) || parsed < mmMin || parsed > mmMax) {
        return { error: `Should be a number between ${mmMin} and ${mmMax}.` };
    } else {
        return { value: parsed };
    }
};

const fieldParsers: FieldParsers<EntryFieldName> = {
    description: parseDescription,
    project: parseProject,
    hh: parseHh,
    mm: parseMm,
} as const;

// type EntryFieldsState = Partial<EntryFields> | undefined;

export const EntryForm = () => {
    const {fields, reset, setField, setFields} = useForm<EntryFields>({ parsers: fieldParsers });

    const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault();

        const parsed = setFields(evt);

        if (everyFieldOk(parsed)) {
            const entry = {
                description: (parsed.description as OkField<string>).value,
                project: (parsed.project as OkField<string>).value,
                duration:
                    (parsed.hh as OkField<number>).value * 60 +
                    (parsed.mm as OkField<number>).value,
            };

            console.debug("entry", entry);
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
                <label htmlFor="description">Description</label>
                <input
                    type="text"
                    name="description"
                    tabIndex={0}
                    onBlur={setField(
                        "description"
                    )}
                />
                <FieldError field={fields?.description} />
            </div>
            <div className={styles.formField}>
                <label htmlFor="project">Project</label>
                <input
                    type="text"
                    name="project"
                    tabIndex={0}
                    onBlur={setField(
                        "project",
                    )}
                />
                <FieldError field={fields?.project} />
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
                            onBlur={setField(
                                "hh",
                            )}
                        />
                        <FieldError field={fields?.hh} />
                    </div>
                    <div>
                        <input
                            className={styles.doubleDigits}
                            type="number"
                            name="mm"
                            tabIndex={0}
                            min={mmMin}
                            max={mmMax}
                            onBlur={setField(
                                "mm",
                            )}
                        />
                        <FieldError field={fields?.mm} />
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
