import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { FieldError } from "./field-error";
import type { FieldState, FieldStateValid, FieldStateInvalid } from "../util";
import styles from "./field-error.module.css";

describe("FieldError", () => {
    describe("rendering", () => {
        it("should render error message when field has error", () => {
            const errorField: FieldStateInvalid<string> = {
                value: "test",
                error: "This field is required",
            };

            render(<FieldError field={errorField} />);

            expect(
                screen.getByText("This field is required"),
            ).toBeInTheDocument();
        });

        it("should render error message when field has undefined value", () => {
            const errorField: FieldStateInvalid<string> = {
                value: undefined,
                error: "Invalid input",
            };

            render(<FieldError field={errorField} />);

            expect(screen.getByText("Invalid input")).toBeInTheDocument();
        });

        it("should not render when field is ok", () => {
            const okField: FieldStateValid<string> = {
                value: "test",
            };

            const { container } = render(<FieldError field={okField} />);

            expect(container.firstChild).toBeNull();
        });

        it("should not render when field is undefined", () => {
            const { container } = render(<FieldError field={undefined} />);

            expect(container.firstChild).toBeNull();
        });

        it("should not render when field is null", () => {
            const { container } = render(<FieldError field={null as any} />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe("styling", () => {
        it("should apply correct CSS class", () => {
            const errorField: FieldStateInvalid<string> = {
                value: "test",
                error: "Error message",
            };

            render(<FieldError field={errorField} />);

            const errorElement = screen.getByText("Error message");
            expect(errorElement).toHaveClass(styles.fieldError);
        });
    });

    describe("different field types", () => {
        it("should work with string field errors", () => {
            const field: FieldStateInvalid<string> = {
                value: "invalid",
                error: "String validation failed",
            };

            render(<FieldError field={field} />);

            expect(
                screen.getByText("String validation failed"),
            ).toBeInTheDocument();
        });

        it("should work with number field errors", () => {
            const field: FieldStateInvalid<number> = {
                value: undefined,
                error: "Must be a valid number",
            };

            render(<FieldError field={field} />);

            expect(
                screen.getByText("Must be a valid number"),
            ).toBeInTheDocument();
        });

        it("should work with boolean field errors", () => {
            const field: FieldStateInvalid<boolean> = {
                value: false,
                error: "Must accept terms",
            };

            render(<FieldError field={field} />);

            expect(screen.getByText("Must accept terms")).toBeInTheDocument();
        });

        it("should work with object field errors", () => {
            const field: FieldStateInvalid<{ name: string }> = {
                value: undefined,
                error: "Object is required",
            };

            render(<FieldError field={field} />);

            expect(screen.getByText("Object is required")).toBeInTheDocument();
        });

        it("should work with array field errors", () => {
            const field: FieldStateInvalid<string[]> = {
                value: [],
                error: "At least one item required",
            };

            render(<FieldError field={field} />);

            expect(
                screen.getByText("At least one item required"),
            ).toBeInTheDocument();
        });
    });

    describe("edge cases", () => {
        it("should handle empty error message", () => {
            const field: FieldStateInvalid<string> = {
                value: "test",
                error: "",
            };

            const { container } = render(<FieldError field={field} />);

            const errorElement = container.querySelector(
                "." + styles.fieldError.split(" ")[0],
            );
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveTextContent("");
        });

        it("should handle multiline error messages", () => {
            const field: FieldStateInvalid<string> = {
                value: "test",
                error: "Line 1\nLine 2\nLine 3",
            };

            const { container } = render(<FieldError field={field} />);

            const errorElement = container.querySelector(
                "." + styles.fieldError.split(" ")[0],
            );
            expect(errorElement).toHaveTextContent("Line 1 Line 2 Line 3");
        });

        it("should handle error messages with special characters", () => {
            const field: FieldStateInvalid<string> = {
                value: "test",
                error: "Error with <>&\"' characters",
            };

            render(<FieldError field={field} />);

            expect(
                screen.getByText("Error with <>&\"' characters"),
            ).toBeInTheDocument();
        });

        it("should handle very long error messages", () => {
            const longMessage = "A".repeat(1000);
            const field: FieldStateInvalid<string> = {
                value: "test",
                error: longMessage,
            };

            render(<FieldError field={field} />);

            expect(screen.getByText(longMessage)).toBeInTheDocument();
        });
    });

    describe("type safety", () => {
        it("should accept Field<unknown> type", () => {
            const field: FieldState<unknown> = {
                value: "anything",
                error: "Some error",
            };

            render(<FieldError field={field} />);

            expect(screen.getByText("Some error")).toBeInTheDocument();
        });

        it("should work with generic Field types", () => {
            const stringField: FieldState<string> = {
                value: undefined,
                error: "String error",
            };

            const numberField: FieldState<number> = {
                value: 42,
            };

            render(
                <div>
                    <FieldError field={stringField} />
                    <FieldError field={numberField} />
                </div>,
            );

            expect(screen.getByText("String error")).toBeInTheDocument();
            expect(screen.queryByText("42")).not.toBeInTheDocument();
        });
    });
});
