"use client";

import { useEffect, useState } from "react";
import { AdminIndexItem } from "@/components/admin/AdminIndexItem";
import { PageHeading } from "@/components/ui/PageHeading";
import { apiFetch } from "@/lib/api";
import styles from "./index.module.css";

export default function AdminPainelPage() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [profilesCount, setProfilesCount] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([apiFetch("/users", { auth: true }), apiFetch("/profiles", { auth: true })])
      .then(async ([usersRes, profilesRes]) => {
        if (!usersRes.ok || !profilesRes.ok) throw new Error();
        const users = await usersRes.json();
        const profiles = await profilesRes.json();
        setUsersCount(users.length);
        setProfilesCount(profiles.length);
      })
      .catch(() => {
        // Sem contagem: os números ficam como "—"
      });
  }, []);

  return (
    <>
      <PageHeading
        title="Painel"
        subtitle="Gerencie os dados que alimentam o catálogo e as builds."
      />

      <div className={styles.index}>
        <AdminIndexItem
          title="Usuários"
          description="Cadastre, edite e exclua as contas de acesso."
          count={usersCount}
          countLabel="usuários cadastrados"
          href="/admin/users"
          linkLabel="Gerenciar usuários"
        />
        <AdminIndexItem
          title="Perfis"
          description="Nome completo, nascimento e avatar de cada usuário."
          count={profilesCount}
          countLabel="perfis cadastrados"
          href="/admin/profiles"
          linkLabel="Gerenciar perfis"
        />
      </div>
    </>
  );
}
