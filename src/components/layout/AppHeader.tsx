import Link from "next/link";
import type { ReactNode } from "react";
import { plexCondensed } from "@/lib/fonts";
import styles from "./AppHeader.module.css";

export type NavItem = {
  label: string;
  /** Vira um link. */
  href?: string;
  /** Vira um botão (ex.: ação que exige login). */
  onClick?: () => void;
  /** Destaca o item (página atual). */
  strong?: boolean;
};

type AppHeaderProps = {
  nav?: NavItem[];
  /** Botões do lado direito. */
  children?: ReactNode;
};

function NavEntry({ item }: { item: NavItem }) {
  const className = `${styles.navLink} ${item.strong ? styles.navLinkStrong : ""}`;

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {item.label}
      </Link>
    );
  }
  if (item.onClick) {
    return (
      <button type="button" className={className} onClick={item.onClick}>
        {item.label}
      </button>
    );
  }
  // Sem destino: é a página atual
  return <span className={item.strong ? className : undefined}>{item.label}</span>;
}

/** Cabeçalho do site: marca, navegação e ações. */
export function AppHeader({ nav = [], children }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={`${styles.brand} ${plexCondensed.className}`}>
          Core Catalog
        </Link>
        {nav.length > 0 && (
          <nav className={styles.nav}>
            {nav.map((item) => (
              <NavEntry key={item.label} item={item} />
            ))}
          </nav>
        )}
      </div>
      <div className={styles.actions}>{children}</div>
    </header>
  );
}
