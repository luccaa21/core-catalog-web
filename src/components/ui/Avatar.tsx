import { getInitials } from "@/lib/format";
import styles from "./Avatar.module.css";

type AvatarProps = {
  name: string;
  url?: string | null;
  size?: "sm" | "lg";
};

/** Foto do avatar, ou as iniciais do nome quando não há URL. */
export function Avatar({ name, url, size = "sm" }: AvatarProps) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={`${styles.avatar} ${styles[size]}`} />;
  }
  return <div className={`${styles.initials} ${styles[size]}`}>{getInitials(name)}</div>;
}
