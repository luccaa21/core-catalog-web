import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import styles from "./Input.module.css";

type Size = "md" | "lg";

function classes(size: Size, className?: string) {
  return [styles.input, size === "lg" && styles.lg, className].filter(Boolean).join(" ");
}

export function Input({
  size = "md",
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { size?: Size }) {
  return <input className={classes(size, className)} {...props} />;
}

export function Select({
  size = "md",
  className,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & { size?: Size }) {
  return <select className={classes(size, className)} {...props} />;
}
