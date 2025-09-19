// Generic record for either for field parsers or field states
export type FormRecord = Record<string, unknown>;

export type FieldStateValid<T> = { value: T; error?: never };

export type FieldStateInvalid<T> = { value: T | undefined; error: string };

export type FieldState<T> = FieldStateInvalid<T> | FieldStateValid<T>;

export type FieldStates<T extends FormRecord = FormRecord> = {
    [K in keyof T]: FieldState<T[K]>;
};

export type FieldStatesValid<T extends FormRecord = FormRecord> = {
    [K in keyof T]: FieldStateValid<T[K]>;
};

export type FieldParser<T> = (
    inputValue: HTMLInputElement["value"] | null,
) => FieldState<T>;

export type FieldParsers<T extends FormRecord = FormRecord> = {
    [K in keyof T]: FieldParser<T[K]>;
};

// Partial Record of Fields with generic inferred from FieldParsers;
export type PartialFieldStatesFromParsers<T extends FieldParsers> = Partial<
    FieldStates<{
        [K in keyof T]: T[K] extends FieldParser<infer R> ? R : never;
    }>
>;

/**
 * Checks if a field state is in an invalid state.
 *
 * @param field - FieldState<T>
 *
 * @returns true when the field is in an invalid state
 */
export const isFieldStateInvalid = <T>(
    field: FieldState<T>,
): field is FieldStateInvalid<T> => "error" in field;

/**
 * Checks if a field state is in a valid state.
 *
 * @param field - FieldState<T>
 *
 * @returns true when the field is in a valid state
 */
export const isFieldStateValid = <T>(
    field: FieldState<T>,
): field is FieldStateValid<T> => !isFieldStateInvalid(field);

/**
 * Checks if all field states are in a valid state or fields is empty.
 *
 * @param fields - FieldStates<T>
 *
 * @returns true when all fields are in a valid state or fields is empty
 */
export const everyFieldStateValid = <T extends FormRecord>(
    fields: FieldStates<T>,
): fields is FieldStatesValid<T> =>
    Object.values(fields).every((field) =>
        isFieldStateValid(field as FieldState<unknown>),
    );
