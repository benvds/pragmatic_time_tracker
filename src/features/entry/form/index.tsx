import ValidityState from "happy-dom/lib/validity-state/ValidityState";
import { FormEventHandler, useState } from "react";

import { Button } from "@/components/button";

import styles from "./index.module.css";

type EntryFormField = "description" | "project" | "hh" | "mm";
type EntryFormErrors = Partial<Record<EntryFormField, string>>;

const descriptionMinLength = 3;
const projectMinLength = 2;
const hhMin = 0;
const hhMax = 24;
const mmMin = 0;
const mmMax = 59;

const FormFieldError = ({
    isDirty,
    errors,
    field,
}: {
    isDirty: boolean;
    errors: Record<string, string>;
    field: string;
}) =>
    isDirty && errors[field] ? (
        <div className={styles.formError}>{errors[field]}</div>
    ) : null;

/**
 *
 * TODO:
 * - [ ] live validate on input when dirty
 * - [ ] focus buttons using border/outline
 */

export const EntryForm = () => {
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState<EntryFormErrors>({});

    const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault();

        if (!isDirty) {
            setIsDirty(true);
        }

        // parse form data

        const formData = new FormData(evt.currentTarget);
        const description = (formData.get("description") as string) ?? "";
        const project = (formData.get("project") as string) ?? "";
        const hh = Number.parseInt((formData.get("hh") as string) ?? "");
        const mm = Number.parseInt((formData.get("mm") as string) ?? "");
        const duration = (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm);

        // validate form

        const parsedErrors: EntryFormErrors = {};

        if (description.length < descriptionMinLength) {
            parsedErrors.description = `At least ${descriptionMinLength} characters needed.`;
        }
        if (project.length < projectMinLength) {
            parsedErrors.project = `At least ${projectMinLength} characters needed.`;
        }
        if (Number.isNaN(hh) || hh < hhMin || hh > hhMax) {
            parsedErrors.hh = `Should be a number between ${hhMin} and ${hhMax}.`;
        }
        if (Number.isNaN(mm) || mm < mmMin || mm > mmMax) {
            parsedErrors.mm = `Should be a number between ${mmMin} and ${mmMax}.`;
        }

        setErrors(parsedErrors);

        // save entry when no errors

        if (Object.entries(parsedErrors).length === 0) {
            const entry = {
                description,
                project,
                duration,
            };

            console.debug("entry", entry);
        }
    };

    const handleReset = () => {
        setErrors({});
    };

    const handleDescriptionInput: FormEventHandler<HTMLInputElement> = (
        evt,
    ) => {
        const descInput = evt.currentTarget;

        if ((descInput.validity as ValidityState).tooShort) {
            descInput.setCustomValidity(
                "The description is too short. Use at least 3 characters.",
            );
        } else {
            descInput.setCustomValidity("");
        }
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
                <input type="text" name="description" tabIndex={0} />
                <FormFieldError field="description" {...{ isDirty, errors }} />
            </div>
            <div className={styles.formField}>
                <label htmlFor="project">Project</label>
                <input type="text" name="project" tabIndex={0} />
                <FormFieldError field="project" {...{ isDirty, errors }} />
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
                        />
                        <FormFieldError field="hh" {...{ isDirty, errors }} />
                    </div>
                    <div>
                        <input
                            className={styles.doubleDigits}
                            type="number"
                            name="mm"
                            tabIndex={0}
                            min={mmMin}
                            max={mmMax}
                        />
                        <FormFieldError field="mm" {...{ isDirty, errors }} />
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
