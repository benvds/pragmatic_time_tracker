type InputValue = HTMLInputElement["value"];

export type FormSchema = Record<string, unknown>;

export type OkField<T> = { value: T; error?: never };
export type ErrorField<T> = { value: T | undefined; error: string };
export type Field<T> = ErrorField<T> | OkField<T>;
export type FieldParser<T> = (inputValue: InputValue) => Field<T>;
export type Fields<T extends FormSchema = FormSchema> = {
    [K in keyof T]: Field<T[K]>;
};
export type OkFields<T extends FormSchema = FormSchema> = {
    [K in keyof T]: OkField<T[K]>;
};

export type FieldParsers<T extends FormSchema = FormSchema> = {
    [K in keyof T]: FieldParser<T[K]>;
};

export const isErrorField = <T>(field: Field<T>): field is ErrorField<T> =>
    "error" in field;

export const isOkField = <T>(field: Field<T>): field is OkField<T> =>
    !isErrorField(field);

export const everyFieldOk = <T extends FormSchema>(
    fields: Fields<T>,
): fields is OkFields<T> =>
    Object.values(fields).every((field) => isOkField(field as Field<unknown>));
