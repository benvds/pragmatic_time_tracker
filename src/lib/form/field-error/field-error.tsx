import { isErrorFieldSate, type FieldState } from "../util";

import styles from "./field-error.module.css";

export const FieldError = ({ field }: { field?: FieldState<unknown> }) =>
    field && isErrorFieldSate(field) ? (
        <div className={styles.fieldError}>{field.error}</div>
    ) : null;
