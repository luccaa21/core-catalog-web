import { money } from "@/lib/format";
import { Input } from "./Input";
import type { InputHTMLAttributes } from "react";

type CurrencyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "size"
> & {
  cents: number;
  onChangeCents: (cents: number) => void;
};

export function CurrencyInput({ cents, onChangeCents, ...props }: CurrencyInputProps) {
  return (
    <Input
      inputMode="numeric"
      value={money(cents)}
      onChange={(e) => onChangeCents(Number(e.target.value.replace(/\D/g, "")) || 0)}
      {...props}
    />
  );
}
