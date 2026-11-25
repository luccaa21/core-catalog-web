import { Avatar } from "@/components/ui/Avatar";
import { plexCondensed } from "@/lib/fonts";
import { formatDate } from "@/lib/format";
import styles from "./ProfilePreview.module.css";

type ProfilePreviewProps = {
  fullName: string;
  avatarUrl: string;
  birthDate: string;
  hasProfile: boolean;
  loading: boolean;
};

/** Prévia do perfil ao lado do formulário, atualizada conforme a pessoa digita. */
export function ProfilePreview({
  fullName,
  avatarUrl,
  birthDate,
  hasProfile,
  loading,
}: ProfilePreviewProps) {
  const previewName = fullName.trim() || "Seu perfil";

  return (
    <>
      <div className={styles.avatarWrap}>
        <Avatar name={previewName} url={avatarUrl.trim()} size="lg" />
        <h2 className={`${styles.name} ${plexCondensed.className}`}>{previewName}</h2>
      </div>

      {!loading && !hasProfile && (
        <p className={styles.empty}>
          Você ainda não tem perfil. Preencha o formulário ao lado para criar o seu.
        </p>
      )}

      <div className={styles.infoList}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Nascimento</span>
          <span className={styles.infoValue}>{birthDate ? formatDate(birthDate) : "—"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Situação</span>
          <span className={styles.infoValue}>{hasProfile ? "Perfil criado" : "Sem perfil"}</span>
        </div>
      </div>
    </>
  );
}
