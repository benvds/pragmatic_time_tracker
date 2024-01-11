import {
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    useState,
} from "react";
import type { Entries } from "type-fest";

import { type FieldParsers } from ".";

export const useForm = <S extends Record<string, unknown>>({
    initial = {},
    parsers,
}: {
    initial?: Partial<S>;
    parsers: FieldParsers;
}) => {
    const [fields, setFields] = useState<Partial<S>>(initial);

    const reset = () => setFields(initial);

    return {
        fields,
        reset,
        setField: setFieldForInputEvent({ setFields, parsers }),
        setFields: setFieldsForFormEvent({ setFields, parsers }),
    };
};
type Setter<T> = (value: T | ((prevState: T) => T)) => void;

// type FieldsState = Record<string, unknown> | undefined;

const setFieldsForFormEvent =
    <P extends FieldParsers, S>({
        parsers,
        setFields,
    }: {
        parsers: P;
        setFields: Setter<S>;
    }) =>
    (evt: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(evt.currentTarget);
        const parserEntries = Object.entries(parsers) as Entries<P>;
        // TODO HERE retain type info
        // const parsedEntries = parserEntries.map(([name, parser]: [keyof P, P[keyof P]) => [
        const parsedEntries = parserEntries.map(
            ([name, parser]) =>
                [name, parser(formData.get(name) as string)] as const,
        );
        const parsed = Object.fromEntries(parsedEntries);

        setFields(parsed);

        return parsed;
    };

const setFieldForInputEvent =
    <P extends FieldParsers, S>({
        parsers,
        setFields,
    }: {
        parsers: P; /// <keyof S>, then S must be an string keyed record
        setFields: Setter<S>;
    }) =>
    (field: keyof P) =>
    (evt: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
        const parser = parsers[field];
        const parsed = parser(evt.currentTarget.value);
        setFields((prev = {} as S) => ({ ...prev, [field]: parsed }));
    };
