import {
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    useState,
} from "react";

import type { FieldStates, FieldParsers, FormRecord } from "./util";

type PartialFormFields<T extends FormRecord> = Partial<FieldStates<T>>;

type Setter<T> = (value: T | ((prevState: T) => T)) => void;

/**
 * Create a form state management hook.
 *
 * @param initial - The initial form state.
 * @param parsers - The parsers for each field.
 *
 * @returns The form state and management functions.
 *
 * Example:
 *
 * const parsers = { email: parseEmail };
 * const { fields, reset, setField, setFields } = useForm({ parsers });
 */
export const useForm = <T extends FormRecord>({
    initial = {},
    parsers,
}: {
    initial?: PartialFormFields<T>;
    parsers: FieldParsers<T>;
}) => {
    const [fieldStates, setFieldStates] = useState(initial);

    const reset = () => setFieldStates(initial);

    return {
        fields: fieldStates,
        reset,
        setField: setFieldForInputEvent<T>({
            setFieldStates,
            parsers,
        }),
        setFields: setFieldsForFormEvent<T>({
            setFieldStates,
            parsers,
        }),
    };
};

/**
 * Sets the form fields based on a form event such as onSubmit.
 *
 * @param parsers - The parsers for each field.
 * @param setFields - The function to set the form fields.
 *
 * @returns a form event handler which returns parsed FieldStates<T>
 *
 * Example:
 *
 * const { setFields } = useForm({ parsers });
 *
 * const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
 *     evt.preventDefault();
 *     const parsedFieldStates = setFields(evt);
 * }
 */
const setFieldsForFormEvent =
    <T extends FormRecord>({
        parsers,
        setFieldStates,
    }: {
        parsers: FieldParsers<T>;
        setFieldStates: Setter<PartialFormFields<T>>;
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

        setFieldStates(result);

        return result;
    };

/**
 * Sets the form field based on a HTMLInputElement change or focus event such as onChange or onBlur.
 *
 * @param parsers - The parsers for each field.
 * @param setFields - The function to set the form fields.
 *
 * @returns an input event handler which returns parsed FieldStates<T>
 *
 * Example:
 *
 * const { setField } = useForm({ parsers });
 *
 * return (<input
 *     name="description"
 *     onBlur={setField("description")}
 * />);
 */
const setFieldForInputEvent =
    <T extends FormRecord>({
        parsers,
        setFieldStates,
    }: {
        parsers: FieldParsers<T>;
        setFieldStates: Setter<PartialFormFields<T>>;
    }) =>
    <K extends keyof T>(field: K) =>
    (evt: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
        const parser = parsers[field];
        const parsed = parser(evt.currentTarget.value);

        setFieldStates((prev = {}) => ({
            ...prev,
            [field]: parsed,
        }));
    };
