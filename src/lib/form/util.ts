export type OkField<T = unknown> = { value: T; error?: never };

export type ErrorField<T = unknown> = {
    value: T | undefined | null;
    error: string;
};

export type Field<T = unknown> = ErrorField<T> | OkField<T>;

export type FieldParser<T = unknown> = (inputValue: string | null) => Field<T>;
export type FieldParsers = Record<string, FieldParser>;

export type FieldKey = string;

export type Fields = Record<string, Field>;
export type FieldsAllOk<F extends Fields> = {
    // type is lost in fields? not unless this function is returned from the original hook
    [Key in keyof F]: OkField<Fields[Key]>;
};

export type FieldParserValue<FP> = FP extends FieldParser<infer T> ? T : never;
export type ParserType<
    P extends FieldParsers,
    K extends keyof P,
> = FieldParserValue<P[K]>;

export const isErrorField = <T>(field: Field<T>): field is ErrorField<T> =>
    "error" in field;

export const isOkField = <T = unknown>(field: Field<T>): field is OkField<T> =>
    !isErrorField(field);

export const everyFieldOk = <F extends Fields>(
    fields: F,
): fields is FieldsAllOk<F> => Object.values(fields).every(isOkField);
