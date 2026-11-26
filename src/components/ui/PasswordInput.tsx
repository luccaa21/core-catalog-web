"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Input } from "./Input";
import styles from "./PasswordInput.module.css";

export function PasswordInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "style">
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrap}>
      <Input
        size="lg"
        type={visible ? "text" : "password"}
        style={{ paddingRight: 44 }}
        {...props}
      />
      <button
        type="button"
        className={styles.eyeButton}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
        </svg>
      </button>
    </div>
  );
}
