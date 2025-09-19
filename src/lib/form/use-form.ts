import {
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    useState,
} from "react";

import type { FieldParsers, PartialFieldStatesFromParsers } from "./util";

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
export const useForm = <FP extends FieldParsers>({
    initial = {},
    parsers,
}: {
    initial?: PartialFieldStatesFromParsers<FP>;
    parsers: FP;
}) => {
    const [fieldStates, setFieldStates] = useState(initial);

    const reset = () => setFieldStates(initial);

    return {
        fields: fieldStates,
        reset,
        setField: setFieldForInputEvent<FP>({
            setFieldStates,
            parsers,
        }),
        setFields: setFieldsForFormEvent<FP>({
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
    <FP extends FieldParsers>({
        parsers,
        setFieldStates,
    }: {
        parsers: FP;
        setFieldStates: Setter<PartialFieldStatesFromParsers<FP>>;
    }) =>
    (evt: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(evt.currentTarget);
        const result = {} as PartialFieldStatesFromParsers<FP>;

        for (const key in parsers) {
            if (Object.prototype.hasOwnProperty.call(parsers, key)) {
                const fieldKey = key as keyof FP;
                const parser = parsers[fieldKey];

                result[fieldKey] = parser(
                    formData.get(fieldKey as string) as string | null,
                ) as PartialFieldStatesFromParsers<FP>[keyof FP];
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
    <FP extends FieldParsers>({
        parsers,
        setFieldStates,
    }: {
        parsers: FP;
        setFieldStates: Setter<PartialFieldStatesFromParsers<FP>>;
    }) =>
    <K extends keyof FP>(field: K) =>
    (evt: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
        const parser = parsers[field];
        const parsed = parser(evt.currentTarget.value);

        setFieldStates((prev = {}) => ({
            ...prev,
            [field]: parsed,
        }));
    };
