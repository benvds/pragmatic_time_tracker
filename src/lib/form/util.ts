// Generic record for either for field parsers or field states
export type FormRecord = Record<string, unknown>;

export type OkFieldState<T> = { value: T; error?: never };

export type ErrorFieldState<T> = { value: T | undefined; error: string };

export type FieldState<T> = ErrorFieldState<T> | OkFieldState<T>;

export type FieldStates<T extends FormRecord = FormRecord> = {
    [K in keyof T]: FieldState<T[K]>;
};

export type OkFieldStates<T extends FormRecord = FormRecord> = {
    [K in keyof T]: OkFieldState<T[K]>;
};

export type FieldParser<T> = (
    inputValue: HTMLInputElement["value"],
) => FieldState<T>;

export type FieldParsers<T extends FormRecord = FormRecord> = {
    [K in keyof T]: FieldParser<T[K]>;
};

export const isErrorFieldSate = <T>(
    field: FieldState<T>,
): field is ErrorFieldState<T> => "error" in field;

export const isOkFieldState = <T>(
    field: FieldState<T>,
): field is OkFieldState<T> => !isErrorFieldSate(field);

export const everyOkFieldStates = <T extends FormRecord>(
    fields: FieldStates<T>,
): fields is OkFieldStates<T> =>
    Object.values(fields).every((field) =>
        isOkFieldState(field as FieldState<unknown>),
    );
