import { isFieldStateInvalid, type FieldState } from "../util";

import styles from "./field-error.module.css";

/**
 * Element that renders the error message if the field is in an error state, otherwise null.

 * @param field - FieldState<T>
 *
 * @returns JSX.Element
 */
export const FieldError = ({ field }: { field?: FieldState<unknown> }) =>
    field && isFieldStateInvalid(field) ? (
        <div className={styles.fieldError}>{field.error}</div>
    ) : null;
