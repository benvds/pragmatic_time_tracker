import styles from "./button.module.css";

export const Button = ({ children, ...props }) => (
    <button {...props} className={styles.pushable}>
        <span className={styles.shadow}></span>
        <span className={styles.edge}></span>
        <span className={styles.front}>{children}</span>
    </button>
);
