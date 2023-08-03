import {
    ChangeEvent,
    // Dispatch,
    FocusEvent,
    FormEvent,
    // FormEventHandler,
    // SetStateAction,
    useState,
} from "react";

import {
    // everyFieldOk,
    // Field,
    // FieldError,
    // type FieldParser,
    type FieldParsers,
    // type Fields,
    // type OkField,
} from ".";

export const useForm = <S extends Record<string, unknown>>({ initial = {}, parsers }: { initial?: Partial<S>, parsers: FieldParsers }) => {
    const [fields, setFields] = useState<Partial<S>>(initial);

    const reset = () => setFields(initial);

    return {
        fields,
        reset,
        setField: setFieldForInputEvent({ setFields, parsers }),
        setFields: setFieldsForFormEvent({ setFields, parsers }),
    }
};
type Setter<T> = (value: T | ((prevState: T) => T)) => void;

// type FieldsState = Record<string, unknown> | undefined;

const setFieldsForFormEvent = <S,>({ parsers, setFields }: {
    setFields: Setter<S>;
    parsers: FieldParsers; /// <keyof S>, then S must be an string keyed record
}) => (evt: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(evt.currentTarget);
    const parsed = Object.fromEntries(
        Object.entries(parsers).map(([name, parser]) => [
            name,
            parser(formData.get(name) as string),
        ]),
    ) as Required<NonNullable<S>>;

    setFields(parsed);

    return parsed;
};
const setFieldForInputEvent =
    <S,>({ parsers, setFields }: {
    setFields: Setter<S>;
    parsers: FieldParsers; /// <keyof S>, then S must be an string keyed record
}) =>
    (field: string) =>
    (evt: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
        const parsed = parsers[field](evt.currentTarget.value);
        setFields((prev = {} as S) => ({ ...prev, [field]: parsed }));
    };
