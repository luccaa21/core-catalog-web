import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

type ProfileFieldsProps = {
  fullName: string;
  onFullNameChange: (value: string) => void;
  birthDate: string;
  onBirthDateChange: (value: string) => void;
  avatarUrl: string;
  onAvatarUrlChange: (value: string) => void;
  disabled?: boolean;
  /** Texto de ajuda do campo de avatar. */
  avatarHint?: string;
};

/** Campos de um perfil: nome completo, data de nascimento e URL do avatar. */
export function ProfileFields({
  fullName,
  onFullNameChange,
  birthDate,
  onBirthDateChange,
  avatarUrl,
  onAvatarUrlChange,
  disabled,
  avatarHint,
}: ProfileFieldsProps) {
  return (
    <>
      <FormField label="Nome completo" htmlFor="fullName">
        <Input
          id="fullName"
          placeholder="Nome completo"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          minLength={2}
          maxLength={120}
          required
          disabled={disabled}
        />
      </FormField>

      <FormField label="Data de nascimento" htmlFor="birthDate">
        <Input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => onBirthDateChange(e.target.value)}
          disabled={disabled}
        />
      </FormField>

      <FormField label="URL do avatar" htmlFor="avatarUrl" hint={avatarHint}>
        <Input
          id="avatarUrl"
          type="url"
          placeholder="https://..."
          value={avatarUrl}
          onChange={(e) => onAvatarUrlChange(e.target.value)}
          maxLength={500}
          disabled={disabled}
        />
      </FormField>
    </>
  );
}
