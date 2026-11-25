"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authed, logout } = useRequireAuth(pathname);

  if (!authed) return null;

  return (
    <PageShell column>
      <AppHeader>
        <Button href="/" variant="secondary">
          Catálogo
        </Button>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
        <Button href="/admin">Painel</Button>
      </AppHeader>

      <div className={styles.body}>
        <AdminSidebar />
        <div className={styles.content}>{children}</div>
      </div>
    </PageShell>
  );
}
