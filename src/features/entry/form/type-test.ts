// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Value = unknown;
type ParsedFieldOk<V extends Value> = { value: V; error?: never };
type ParsedFieldError = { error: string };
type ParsedField<V extends Value = Value> = ParsedFieldError | ParsedFieldOk<V>;
const isFieldOk = <V extends Value>(
    field: ParsedField<V>,
): field is ParsedFieldOk<V> => !("error" in field);
// const isFieldError = <V extends Value>(field: ParsedField<V>): field is ParsedFieldError =>
//     "error" in field;

const t: ParsedField<number> = { value: 2 };
console.debug("t", t);

// const fields = [
//     { value: "one" },
//     { value: 2 },
//     { error: "error 3" },
// ] satisfies ParsedField[]; // dNo overload matches this call.
// const fields = [
//     { value: "one" },
//     { value: 2 },
//     { error: "error 3" },
// ] as const; // does not work
const fields: ParsedField[] = [
    { value: "one" },
    { value: 2 },
    { error: "error 3" },
]; // works
// const fields: readonly ParsedField[] = [
//     { value: "one" },
//     { value: 2 },
//     { error: "error 3" },
// ] as const; // works
const fieldMap: Record<string, ParsedField<Value>> = {
    one: { value: "one" },
    two: { value: 2 },
    three: { error: "error 3" },
};
const fieldsOnlyOk = fields.filter(isFieldOk);
const allOkInMap = Object.values(fieldMap).every(isFieldOk);

export default {};
