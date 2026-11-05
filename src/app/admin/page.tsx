"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { getToken } from "../login/auth_service";
import styles from "./admin.module.css";

const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPainelPage() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [profilesCount, setProfilesCount] = useState<number | null>(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken() ?? ""}` };

    Promise.all([
      fetch(`${API}/users`, { headers }),
      fetch(`${API}/profiles`, { headers }),
    ])
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
      <div>
        <h1 className={`${styles.title} ${plexCondensed.className}`}>Painel</h1>
        <p className={styles.subtitle}>
          Gerencie os dados que alimentam o catálogo e as builds.
        </p>
      </div>

      <div className={styles.index}>
        <div className={styles.indexItem}>
          <div className={styles.indexText}>
            <p className={`${styles.indexTitle} ${plexCondensed.className}`}>Usuários</p>
            <p className={styles.indexDesc}>Cadastre, edite e exclua as contas de acesso.</p>
          </div>
          <div className={styles.count}>
            <p className={`${styles.countValue} ${plexCondensed.className}`}>
              {usersCount ?? "—"}
            </p>
            <span className={styles.countLabel}>usuários cadastrados</span>
          </div>
          <Link href="/admin/users" className={styles.btnOutline}>
            Gerenciar usuários
          </Link>
        </div>

        <div className={styles.indexItem}>
          <div className={styles.indexText}>
            <p className={`${styles.indexTitle} ${plexCondensed.className}`}>Perfis</p>
            <p className={styles.indexDesc}>Nome completo, nascimento e avatar de cada usuário.</p>
          </div>
          <div className={styles.count}>
            <p className={`${styles.countValue} ${plexCondensed.className}`}>
              {profilesCount ?? "—"}
            </p>
            <span className={styles.countLabel}>perfis cadastrados</span>
          </div>
          <Link href="/admin/profiles" className={styles.btnOutline}>
            Gerenciar perfis
          </Link>
        </div>
      </div>
    </>
  );
}