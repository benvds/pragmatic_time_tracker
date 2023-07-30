export type OkField<T = unknown> = { value: T; error?: never };
export type ErrorField = { error: string };
export type Field<T = unknown> = ErrorField | OkField<T>;
export type FieldParser<T = unknown> = (inputValue: string | null) => Field<T>;
export type Fields<
    Key extends string = string,
    F extends Field = Field,
> = Record<Key, F>;
export type FieldParsers<Key extends string = string> = Record<
    Key,
    FieldParser
>;

export const isErrorField = <T>(field: Field<T>): field is ErrorField =>
    "error" in field;

export const isOkField = <T>(field: Field<T>): field is OkField<T> =>
    !isErrorField(field);

export const everyFieldOk = (fields: Fields) =>
    Object.values(fields).every(isOkField);
