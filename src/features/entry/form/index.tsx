import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

const descriptionMinLength = 3;
const hhMin = 0;
const hhMax = 24;
const mmMin = 0;
const mmMax = 59;

export const EntryForm = () => {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            description: "",
            hh: 0,
            mm: 0,
        },
        validate: {
            description: (value) => {
                if (!value || value.length === 0) {
                    return "Required";
                }
                if (value.length < descriptionMinLength) {
                    return `At least ${descriptionMinLength} characters needed`;
                }
                return null;
            },
            hh: (value) => {
                if (value < hhMin || value > hhMax) {
                    return `Should be a number between ${hhMin} and ${hhMax}.`;
                }
                return null;
            },
            mm: (value) => {
                if (value < mmMin || value > mmMax) {
                    return `Should be a number between ${mmMin} and ${mmMax}.`;
                }
                return null;
            },
        },
    });

    const handleSubmit = form.onSubmit((values) => {
        const entry = {
            description: values.description,
            duration: values.hh * 60 + values.mm,
        };

        console.debug("entry", entry);
    });

    return (
        <form onSubmit={handleSubmit} onReset={form.reset} noValidate>
            <Stack gap="md">
                <TextInput
                    label="Description"
                    key={form.key("description")}
                    {...form.getInputProps("description")}
                />

                <Group gap="xs">
                    <NumberInput
                        label="Hours"
                        min={hhMin}
                        max={hhMax}
                        key={form.key("hh")}
                        {...form.getInputProps("hh")}
                        w={100}
                    />
                    <NumberInput
                        label="Minutes"
                        min={mmMin}
                        max={mmMax}
                        key={form.key("mm")}
                        {...form.getInputProps("mm")}
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
