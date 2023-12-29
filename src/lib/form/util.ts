export type OkField<T> = { value: T; error?: never };

export type ErrorField<T> = { value: T | undefined | null; error: string };

export type Field<T = unknown> = ErrorField<T> | OkField<T>;

export type FieldParser<T = unknown> = (inputValue: string | null) => Field<T>;

export type FieldKey = string;

export type Fields<
    Key extends FieldKey = string,
    F extends Field = Field,
> = Record<Key, F>;

export type FieldParsers<Key extends FieldKey> = Record<Key, FieldParser>;

export const isErrorField = <T>(field: Field<T>): field is ErrorField<T> =>
    "error" in field;

export const isOkField = <T = unknown>(field: Field<T>): field is OkField<T> =>
    !isErrorField(field);

export const everyFieldOk = <F extends Fields>(
    fields: F,
): fields is Fields<keyof F, OkField<F[keyof F]>> =>
    Object.values(fields).every(isOkField);
