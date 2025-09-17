import {
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    useState,
} from "react";

import type { Fields, FieldParsers, FormSchema } from "./util";

type PartialFormFields<T extends FormSchema> = Partial<Fields<T>>;

export const useForm = <T extends FormSchema>({
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
    <T extends FormSchema>({
        parsers,
        setFields,
    }: {
        setFields: Setter<PartialFormFields<T>>;
        parsers: FieldParsers<T>;
    }) =>
    (evt: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(evt.currentTarget);
        const result = {} as Fields<T>;

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
    <T extends FormSchema>({
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
