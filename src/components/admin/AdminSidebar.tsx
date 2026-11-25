"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.css";

const NAV = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/users", label: "Usuários" },
  { href: "/admin/profiles", label: "Perfis" },
  { href: "/admin/components", label: "Peças" },
  { href: "/admin/manufacturers", label: "Fabricantes" },
];

/** Menu lateral do admin, com o item da página atual destacado. */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar}>
      {NAV.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${active ? styles.active : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
