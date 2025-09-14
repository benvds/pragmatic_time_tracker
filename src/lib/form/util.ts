type InputValue = HTMLInputElement["value"];

export type OkField<T> = { value: T; error?: never };
export type ErrorField<T> = { value: T | undefined; error: string };
export type Field<T> = ErrorField<T> | OkField<T>;
export type FieldParser<T> = (inputValue: InputValue) => Field<T>;
export type Fields<T = Record<string, unknown>> = {
    [K in keyof T]: Field<T[K]>;
};
export type OkFields<T = Record<string, unknown>> = {
    [K in keyof T]: OkField<T[K]>;
};

export type FieldParsers<T = Record<string, unknown>> = {
    [K in keyof T]: FieldParser<T[K]>;
};

export const isErrorField = <T>(field: Field<T>): field is ErrorField<T> =>
    "error" in field;

export const isOkField = <T>(field: Field<T>): field is OkField<T> =>
    !isErrorField(field);

export const everyFieldOk = <T>(fields: Fields<T>): fields is OkFields<T> =>
    Object.values(fields).every((field) => isOkField(field as Field<unknown>));

/**
 * Parse and validate ISO date string (YYYY-MM-DD)
 * Validates format and ensures date is not in the future
 */
export const parseDate: FieldParser<string> = (input) => {
    if (input === null || input.length === 0) {
        return { value: undefined, error: "Date is required" };
    }

    // Check ISO date format (YYYY-MM-DD)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(input)) {
        return {
            value: undefined,
            error: "Date must be in YYYY-MM-DD format",
        };
    }

    // Validate that it's a real date
    const date = new Date(input);
    if (isNaN(date.getTime())) {
        return {
            value: undefined,
            error: "Invalid date",
        };
    }

    // Check that the input matches what we get back (handles invalid dates like Feb 30)
    const isoString = date.toISOString().split("T")[0];
    if (isoString !== input) {
        return {
            value: undefined,
            error: "Invalid date",
        };
    }

    // Check that date is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(input);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate > today) {
        return {
            value: undefined,
            error: "Cannot create entries for future dates",
        };
    }

    return { value: input };
};
