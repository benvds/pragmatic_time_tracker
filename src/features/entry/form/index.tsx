import { type FormEventHandler } from "react";
import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";

import { everyFieldStateValid, type FieldParser, useForm } from "@/lib/form";

const descriptionMinLength = 3;
const hhMin = 0;
const hhMax = 24;
const mmMin = 0;
const mmMax = 59;

const parseDescription: FieldParser<string> = (input) => {
    if (input === null || input.length === 0) {
        return { value: undefined, error: `Required` };
    } else if (input.length < descriptionMinLength) {
        return {
            value: undefined,
            error: `At least ${descriptionMinLength} characters needed`,
        };
    } else {
        return { value: input };
    }
};

const parseHh: FieldParser<number> = (input) => {
    const parsed = Number.parseInt(input ?? "");

    if (Number.isNaN(parsed) || parsed < hhMin || parsed > hhMax) {
        return {
            value: undefined,
            error: `Should be a number between ${hhMin} and ${hhMax}.`,
        };
    } else {
        return { value: parsed };
    }
};

const parseMm: FieldParser<number> = (input) => {
    const parsed = Number.parseInt(input ?? "");

    if (Number.isNaN(parsed) || parsed < mmMin || parsed > mmMax) {
        return {
            value: undefined,
            error: `Should be a number between ${mmMin} and ${mmMax}.`,
        };
    } else {
        return { value: parsed };
    }
};

const fieldParsers = {
    description: parseDescription,
    hh: parseHh,
    mm: parseMm,
};

export const EntryForm = () => {
    const { fields, reset, setField, setFields } = useForm({
        parsers: fieldParsers,
    });

    const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault();

        const parsed = setFields(evt);

        if (everyFieldStateValid(parsed)) {
            const entry = {
                description: parsed.description.value,
                duration: parsed.hh.value * 60 + parsed.mm.value,
            };

            console.debug("entry", entry);
        }
    };

    return (
        <form onSubmit={handleSubmit} onReset={reset} noValidate>
            <Stack gap="md">
                <TextInput
                    label="Description"
                    name="description"
                    onBlur={setField("description")}
                    error={fields?.description?.error}
                />

                <Group gap="xs">
                    <NumberInput
                        label="Hours"
                        name="hh"
                        min={hhMin}
                        max={hhMax}
                        onBlur={setField("hh")}
                        error={fields?.hh?.error}
                        w={100}
                    />
                    <NumberInput
                        label="Minutes"
                        name="mm"
                        min={mmMin}
                        max={mmMax}
                        onBlur={setField("mm")}
                        error={fields?.mm?.error}
                        w={100}
                    />
                </Group>

                <Group>
                    <Button type="submit">Save</Button>
                    <Button variant="outline" type="reset">
                        Reset
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
