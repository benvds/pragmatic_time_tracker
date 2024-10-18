export type OkField<T> = { value: T; error?: never };
export type ErrorField<T> = {
    value: T | string | null | undefined;
    error: string;
};

export type Field<T = unknown> = ErrorField<T> | OkField<T>;

export type FieldParserInput = string | null;

export type FieldParser<T = unknown> = (
    inputValue: FieldParserInput,
) => Field<T>;

export type FieldParsers = Record<string, FieldParser>;

// export type FieldKey = string;

export type FormState<FP extends FieldParsers> = {
    [K in keyof FP]: ReturnType<FP[K]>;
};

// export type Fields = Record<string, Field>;

type OkFieldFromField<F extends Field> = F extends Field<infer T>
    ? OkField<T>
    : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ErrorFieldFromField<F extends Field> = F extends Field<infer T>
    ? ErrorField<T>
    : never;

type OkFieldFromFieldParser<FP> = FP extends FieldParser<infer T>
    ? OkField<T>
    : never;

// TODO HERE @benvds,
export type FieldsAllOk<FP extends Partial<FormState<any>>> = {
    // TODO Here check if field extends OkField
    [K in keyof FP]: OkFieldFromFieldParser<FP[K]>;
};

export const isErrorField = <T>(field: Field<T>): field is ErrorField<T> =>
    "error" in field;

export const isOkField = <T>(field: Field<T>): field is OkField<T> =>
    !isErrorField(field);

export const everyFieldOk = <FP extends FieldParsers>(
    fieldParsers: FP,
    state: unknown, // Partial<FormState<FP>>, this just doesnt work, dont even try
): state is FieldsAllOk<FP> => {
    return Object.keys(fieldParsers).every((fieldName: keyof FP) => {
        type FieldType = ReturnType<FP[keyof FP]>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        const fieldState = (state as any)[fieldName] as FieldType; // const fieldState: Field<unknown> <-- unknown HERE
        return fieldState !== undefined && isOkField(fieldState);
    }) as boolean;
};
