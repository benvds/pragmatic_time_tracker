import { FocusEventHandler, FormEventHandler, useState } from "react";

import { Button } from "@/components/button";

import styles from "./index.module.css";

type ParsedValue = string | number;
type ParsedFieldSuccess<V extends ParsedValue = ParsedValue> = { value: V };
type ParsedFieldError = { error: string };
type ParsedField<V extends ParsedValue = ParsedValue> =
    | ParsedFieldError
    | ParsedFieldSuccess<V>;
type FieldParser<V extends ParsedValue = ParsedValue> = (
    inputValue: string | null,
) => ParsedField<V>;

const entryFormFields = ["description", "project", "hh", "mm"] as const;
type EntryFormField = (typeof entryFormFields)[number];
type EntryFieldParsers = Record<EntryFormField, FieldParser>;
type EntryParsedFields = Partial<Record<EntryFormField, ParsedField>>;

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

const fieldParsers: EntryFieldParsers = {
    description: parseDescription,
    project: parseProject,
    hh: parseHh,
    mm: parseMm,
} as const;

const FormFieldError = ({ field }: { field?: ParsedField }) =>
    field && "error" in field ? (
        <div className={styles.formError}>{field.error}</div>
    ) : null;

const withoutErrors = (
    fields: EntryParsedFields,
): fields is Record<EntryFormField, ParsedFieldSuccess> =>
    Object.values(fields).filter((field) => "error" in field).length === 0;

/**
 *
 * TODO:
 * - [x] live validate on blur
 * - [x] start validating on first change, field after change on input
 * - [ ] refactor parser setup, at least on blur
 * - [ ] focus buttons using border/outline
 */

export const EntryForm = () => {
    const [parsedFields, setParsedFields] = useState<
        EntryParsedFields | undefined
    >();

    const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault();

        const formData = new FormData(evt.currentTarget);
        const parsed = Object.fromEntries(
            Object.entries(fieldParsers).map(([field, parser]) => [
                field,
                parser(formData.get(field) as string),
            ]),
        ) as EntryParsedFields;

        setParsedFields(parsed);

        console.debug("parsed", parsed);

        if (withoutErrors(parsed)) {
            const entry = {
                description: parsed.description.value,
                project: parsed.project.value,
                duration:
                    (parsed.hh.value as number) * 60 +
                    (parsed.mm.value as number),
            };

            console.debug("entry", entry);
        }
    };

    const handleReset = () => {
        setParsedFields(undefined);
    };

    const handleDescriptionBlur: FocusEventHandler<HTMLInputElement> = (
        evt,
    ) => {
        const parsed = parseDescription(evt.currentTarget.value);
        setParsedFields((prev = {}) => ({ ...prev, description: parsed }));
    };

    const handleProjectBlur: FocusEventHandler<HTMLInputElement> = (evt) => {
        const parsed = parseProject(evt.currentTarget.value);
        setParsedFields((prev = {}) => ({ ...prev, project: parsed }));
    };

    const handleHhBlur: FocusEventHandler<HTMLInputElement> = (evt) => {
        const parsed = parseHh(evt.currentTarget.value);
        setParsedFields((prev = {}) => ({ ...prev, hh: parsed }));
    };

    const handleMmBlur: FocusEventHandler<HTMLInputElement> = (evt) => {
        const parsed = parseMm(evt.currentTarget.value);
        setParsedFields((prev = {}) => ({ ...prev, mm: parsed }));
    };

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
            onReset={handleReset}
            noValidate
        >
            <div className={styles.formField}>
                <label htmlFor="description">Description</label>
                <input
                    type="text"
                    name="description"
                    tabIndex={0}
                    onBlur={handleDescriptionBlur}
                />
                <FormFieldError field={parsedFields?.description} />
            </div>
            <div className={styles.formField}>
                <label htmlFor="project">Project</label>
                <input
                    type="text"
                    name="project"
                    tabIndex={0}
                    onBlur={handleProjectBlur}
                />
                <FormFieldError field={parsedFields?.project} />
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
                            onBlur={handleHhBlur}
                        />
                        <FormFieldError field={parsedFields?.hh} />
                    </div>
                    <div>
                        <input
                            className={styles.doubleDigits}
                            type="number"
                            name="mm"
                            tabIndex={0}
                            min={mmMin}
                            max={mmMax}
                            onBlur={handleMmBlur}
                        />
                        <FormFieldError field={parsedFields?.mm} />
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
