import {
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    useState,
} from "react";

import type { FieldStates, FieldParsers, FormRecord } from "./util";

type PartialFormFields<T extends FormRecord> = Partial<FieldStates<T>>;

export const useForm = <T extends FormRecord>({
    initial = {},
    parsers,
}: {
    initial?: PartialFormFields<T>;
    parsers: FieldParsers<T>;
}) => {
    const [fields, setFields] = useState(initial);

    const reset = () => setFields(initial);

    return {
        fields,
        reset,
        setField: setFieldForInputEvent<T>({ setFields, parsers }),
        setFields: setFieldsForFormEvent<T>({ setFields, parsers }),
    };
};

type Setter<T> = (value: T | ((prevState: T) => T)) => void;

const setFieldsForFormEvent =
    <T extends FormRecord>({
        parsers,
        setFields,
    }: {
        setFields: Setter<PartialFormFields<T>>;
        parsers: FieldParsers<T>;
    }) =>
    (evt: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(evt.currentTarget);
        const result = {} as FieldStates<T>;

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
    <T extends FormRecord>({
        parsers,
        setFields,
    }: {
        parsers: FieldParsers<T>;
        setFields: Setter<PartialFormFields<T>>;
    }) =>
    <K extends keyof T>(field: K) =>
    (evt: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
        const parser = parsers[field];
        const parsed = parser(evt.currentTarget.value);

        setFields((prev = {}) => ({
            ...prev,
            [field]: parsed,
        }));
    };
