import { Button, Group, NumberInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import styles from "./index.module.css";

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

        // Reset form after successful submission
        form.reset();
    });

    return (
        <form onSubmit={handleSubmit} onReset={form.reset} noValidate className={styles.form}>
            <div className={styles.dateColumn}>
                <TextInput
                    placeholder="Today"
                    variant="unstyled"
                    className={styles.dateInput}
                    value={new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    })}
                    readOnly
                />
            </div>

            <div className={styles.durationColumn}>
                <Group gap="xs" className={styles.timeInputs}>
                    <NumberInput
                        placeholder="0"
                        min={hhMin}
                        max={hhMax}
                        key={form.key("hh")}
                        {...form.getInputProps("hh")}
                        size="sm"
                        variant="unstyled"
                        className={styles.hourInput}
                    />
                    <span className={styles.timeSeparator}>h</span>
                    <NumberInput
                        placeholder="0"
                        min={mmMin}
                        max={mmMax}
                        key={form.key("mm")}
                        {...form.getInputProps("mm")}
                        size="sm"
                        variant="unstyled"
                        className={styles.minuteInput}
                    />
                    <span className={styles.timeSeparator}>m</span>
                </Group>
            </div>

            <div className={styles.descriptionColumn}>
                <Group gap="xs">
                    <TextInput
                        placeholder="Enter task description..."
                        key={form.key("description")}
                        {...form.getInputProps("description")}
                        size="sm"
                        variant="unstyled"
                        className={styles.descriptionInput}
                    />
                    <Button
                        type="submit"
                        size="xs"
                        variant="subtle"
                        className={styles.saveButton}
                    >
                        Save
                    </Button>
                    <Button
                        variant="subtle"
                        type="reset"
                        size="xs"
                        color="gray"
                        className={styles.resetButton}
                    >
                        Clear
                    </Button>
                </Group>
            </div>
        </form>
    );
};
