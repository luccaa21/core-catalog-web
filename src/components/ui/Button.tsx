import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type CommonProps = {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

type LinkProps = CommonProps & { href: string };

/** Botão padrão. Com `href` vira um link (next/link) com a mesma aparência. */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", fullWidth, className, children } = props;
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    className: _className,
    type = "button",
    ...rest
  } = props;
  void [_variant, _size, _fullWidth, _className];

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
