import {
    type ChangeEvent,
    type Dispatch,
    type FocusEvent,
    type FormEvent,
    type SetStateAction,
    useState,
} from "react";

import { type FieldParsers } from ".";
import { everyFieldOk, FormState } from "./util";

type Setter<T> = Dispatch<SetStateAction<T>>;

export const useForm = <FP extends FieldParsers>({
    initial = {},
    parsers,
}: {
    initial?: Partial<FormState<FP>>;
    parsers: FP;
}) => {
    const [fields, setFields] = useState<Partial<FormState<FP>>>(initial);

    const reset = () => setFields(initial);

    const allFieldsOk = (state: Partial<FormState<FP>>) =>
        everyFieldOk<FP>(parsers, state);

    return {
        fields,
        reset,
        allFieldsOk,
        setField: setFieldForInputEvent({ setFields, parsers }),
        setFields: setFieldsForFormEvent({ setFields, parsers }),
    };
};

// TODO split up logic from react specific logic

const setFieldsForFormEvent =
    <FP extends FieldParsers>({
        parsers,
        setFields,
    }: {
        parsers: FP;
        setFields: Setter<Partial<FormState<FP>>>;
    }) =>
    (evt: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(evt.currentTarget);
        const parserEntries = Object.entries(parsers);
        // TODO HERE @benvds retain type info
        // const parsedEntries = parserEntries.map(([name, parser]: [keyof P, P[keyof P]) => [

        const parsedEntries = parserEntries.map(
            ([name, parser]) => [name, parser(formData.get(name))] as const,
        );
        const parsed = Object.fromEntries(parsedEntries) as Partial<
            FormState<FP>
        >;

        setFields(parsed);

        return parsed;
    };

const setFieldForInputEvent =
    <FP extends FieldParsers>({
        parsers,
        setFields,
    }: {
        parsers: FP; /// <keyof S>, then S must be an string keyed record
        setFields: Setter<Partial<FormState<FP>>>;
    }) =>
    (field: keyof FP) =>
    (evt: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
        const parser = parsers[field];
        const parsed = parser(evt.currentTarget.value);

        return setFields((prev) => ({ ...prev, [field]: parsed }));
    };
