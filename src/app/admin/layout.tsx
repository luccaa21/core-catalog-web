"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IBM_Plex_Sans } from "next/font/google";
import { clearToken, isAuthenticated } from "../login/auth_service";
import styles from "./admin.module.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"] });

const NAV = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/users", label: "Usuários" },
  { href: "/admin/profiles", label: "Perfis" },
  { href: "/admin/components", label: "Peças" },
  { href: "/admin/manufacturers", label: "Fabricantes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setReady(true);
  }, [pathname, router]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  if (!ready) return null;

  return (
    <div className={`${styles.page} ${plexSans.className}`}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          Core Catalog
        </Link>
        <div className={styles.actions}>
          <Link href="/" className={styles.btnSecondary}>
            Catálogo
          </Link>
          <button type="button" className={styles.btnSecondary} onClick={logout}>
            Sair
          </button>
          <Link href="/admin" className={styles.btnPrimary}>
            Painel
          </Link>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar}>
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}