import { clsx } from "clsx";
import { type ButtonHTMLAttributes } from "react";

import styles from "./button.module.css";

type ButtonVariant = "solid" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant: ButtonVariant;
};

export const Button = ({
    variant = "solid",
    children,
    ...props
}: ButtonProps) => {
    const classNamePushable = clsx(styles.pushable, {});
    const classNameEdge = clsx(styles.edge, {
        [styles.edgeSolid]: variant === "solid",
    });
    const classNameFront = clsx(styles.front, {
        [styles.frontGhost]: variant === "ghost",
        [styles.frontSolid]: variant === "solid",
    });

    return (
        <button {...props} className={classNamePushable}>
            {variant === "solid" ? (
                <span className={styles.shadow}></span>
            ) : null}
            <span className={classNameEdge}></span>
            <span className={classNameFront}>{children}</span>
        </button>
    );
};
