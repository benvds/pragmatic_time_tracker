import {
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    useState,
} from "react";

import { type Field, type FieldParser } from "./util";

export const useForm = <T extends Record<string, unknown>>({
    initial = {},
    parsers,
}: {
    initial?: Partial<{ [K in keyof T]: Field<T[K]> }>;
    parsers: { [K in keyof T]: FieldParser<T[K]> };
}) => {
    const [fields, setFields] =
        useState<Partial<{ [K in keyof T]: Field<T[K]> }>>(initial);

    const reset = () => setFields(initial);

    return {
        fields,
        reset,
        setField: setFieldForInputEvent<T>({ setFields, parsers }),
        setFields: setFieldsForFormEvent<T>({ setFields, parsers }),
    };
};
// TODO: use the react setter type directly
type Setter<T> = (value: T | ((prevState: T) => T)) => void;

// type FieldsState = Record<string, unknown> | undefined;

const setFieldsForFormEvent =
    <T extends Record<string, unknown>>({
        parsers,
        setFields,
    }: {
        setFields: Setter<Partial<{ [K in keyof T]: Field<T[K]> }>>;
        parsers: { [K in keyof T]: FieldParser<T[K]> };
    }) =>
    (evt: FormEvent<HTMLFormElement>): { [K in keyof T]: Field<T[K]> } => {
        const formData = new FormData(evt.currentTarget);

        // Create a properly typed result object
        const result = {} as { [K in keyof T]: Field<T[K]> };

        // Process each field with its corresponding parser
        for (const key in parsers) {
            if (Object.prototype.hasOwnProperty.call(parsers, key)) {
                const fieldKey = key as keyof T;
                const parser = parsers[fieldKey];
                result[fieldKey] = parser(formData.get(key) as string);
            }
        }

        setFields(result);
        return result;
    };

const setFieldForInputEvent =
    <T extends Record<string, unknown>>({
        parsers,
        setFields,
    }: {
        parsers: { [K in keyof T]: FieldParser<T[K]> };
        setFields: Setter<Partial<{ [K in keyof T]: Field<T[K]> }>>;
    }) =>
    <K extends keyof T>(field: K) =>
    (evt: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
        const parser = parsers[field];
        const parsed = parser(evt.currentTarget.value);
        setFields((prev = {} as Partial<{ [K in keyof T]: Field<T[K]> }>) => ({
            ...prev,
            [field]: parsed,
        }));
    };
