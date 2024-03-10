export type OkField<T> = { value: T; error?: never };
export type ErrorField<T> = {
    value: T | string | null | undefined;
    error: string;
};
export type Field<T> = ErrorField<T> | OkField<T>;

export type Fields = Record<string, Field<unknown>>;

export type FieldsAllOk<F extends Fields> = {
    [Key in keyof F]: F[Key] extends OkField<infer T> ? OkField<T> : never;
};

const f = {
    a: { value: 1 },
    // b: { value: 1, error: "foo" },
} satisfies Fields;
// const f: Fields = {
//     a: { value: 1 },
//     // b: { value: 1, error: "foo" },
// };
const allOk: FieldsAllOk<typeof f> = f; // this works

console.debug(allOk.a); // typeof a = OkField<number>

export const isOkField = <T>(field: Field<T>): field is OkField<T> =>
    !("error" in field);
export const isErrorField = <T>(field: Field<T>): field is ErrorField<T> =>
    "error" in field;

export const everyFieldOk = (
    fields: Fields,
    // ): fields is FieldsAllOk<typeof fields> => !Object.values(fields).some(isErrorField);
): fields is FieldsAllOk<typeof fields> =>
    Object.values(fields).every(isOkField);

if (everyFieldOk(f)) {
    console.log(f);
} else {
    console.warn(f);
}

// export const isOkField = <T>(field: Field<T>): field is OkField<T> =>
//     !isErrorField(field);

export type FieldParser<T = unknown> = (inputValue: string | null) => Field<T>;
export type FieldParsers = Record<string, FieldParser>;

export type FieldKey = string;

const myFields: Fields = {
    ok: { value: true },
    notOk: { value: null, error: "str" },
};

const myOkeFields = myFields as FieldsAllOk<typeof myFields>;

const myProp = myOkeFields["ok"];

type propCheck = typeof myProp;

export type FieldParserValue<FP> = FP extends FieldParser<infer T> ? T : never;
export type ParserType<
    P extends FieldParsers,
    K extends keyof P,
> = FieldParserValue<P[K]>;
