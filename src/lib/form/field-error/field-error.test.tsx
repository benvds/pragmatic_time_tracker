import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { FieldError } from "./field-error";
import styles from "./field-error.module.css";

describe("FieldError", () => {
    it("should render error message when field is invalid", () => {
        const error = "This field is required";
        const invalidField = {
            value: "test",
            error,
        };

        render(<FieldError field={invalidField} />);

        expect(screen.getByText(error)).toBeInTheDocument();
    });

    it("should not render when field is valid", () => {
        const validField = {
            value: "valid",
        };

        const { container } = render(<FieldError field={validField} />);

        expect(container.firstChild).toBeNull();
    });

    it("should not render when field is undefined", () => {
        const { container } = render(<FieldError field={undefined} />);

        expect(container.firstChild).toBeNull();
    });
});

describe("styling", () => {
    it("should apply correct CSS class", () => {
        const error = "Error message";
        const invalidField = {
            value: "test",
            error,
        };

        render(<FieldError field={invalidField} />);

        const errorElement = screen.getByText(error);
        expect(errorElement).toHaveClass(styles.fieldError);
    });
});
