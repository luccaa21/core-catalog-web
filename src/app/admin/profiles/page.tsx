"use client";

import { useEffect, useState } from "react";
import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { getToken } from "../../login/auth_service";
import styles from "./profiles.module.css";

const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const API = process.env.NEXT_PUBLIC_API_URL;

type User = { id: number; name: string; email: string };

type Profile = {
  id: number;
  userId: number;
  fullName: string;
  birthDate: string | null; // vem como ISO: "2003-05-10T00:00:00.000Z"
  avatarUrl: string | null;
  user: { name: string; email: string };
};

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={styles.avatar} />;
  }
  return <div className={styles.avatarInitials}>{getInitials(name)}</div>;
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [id, setId] = useState<number | null>(null);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = id !== null;

  // Um usuário só pode ter um perfil. Ao editar, o usuário do próprio perfil continua na lista.
  const availableUsers = users.filter(
    (user) =>
      !profiles.some((p) => p.userId === user.id) ||
      (isEditing && profiles.find((p) => p.id === id)?.userId === user.id)
  );

  async function load() {
    try {
      const [profilesRes, usersRes] = await Promise.all([
        fetch(`${API}/profiles`, { headers: authHeaders() }),
        fetch(`${API}/users`, { headers: authHeaders() }),
      ]);
      if (!profilesRes.ok || !usersRes.ok) throw new Error();
      setProfiles(await profilesRes.json());
      setUsers(await usersRes.json());
    } catch {
      setError("Não foi possível carregar os dados. Verifique a API e o login.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setId(null);
    setUserId("");
    setFullName("");
    setBirthDate("");
    setAvatarUrl("");
  }

  function edit(profile: Profile) {
    setError("");
    setId(profile.id);
    setUserId(String(profile.userId));
    setFullName(profile.fullName);
    setBirthDate(profile.birthDate ? profile.birthDate.slice(0, 10) : "");
    setAvatarUrl(profile.avatarUrl ?? "");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    // Campos vazios não são enviados (undefined some no JSON)
    const fields = {
      fullName: fullName.trim(),
      birthDate: birthDate || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
    };
    const body = isEditing ? fields : { userId: Number(userId), ...fields };

    try {
      const response = await fetch(
        isEditing ? `${API}/profiles/${id}` : `${API}/profiles`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
        setError(String(msg ?? "Erro ao salvar o perfil."));
        return;
      }

      resetForm();
      await load();
    } catch {
      setError("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(profileId: number) {
    if (!confirm("Excluir este perfil?")) return;
    setError("");
    try {
      const response = await fetch(`${API}/profiles/${profileId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error();
      if (id === profileId) resetForm();
      await load();
    } catch {
      setError("Não foi possível excluir o perfil.");
    }
  }

  return (
    <>
      <h1 className={`${styles.title} ${plexCondensed.className}`}>Perfis</h1>

      {error && (
        <div className={styles.alert} role="alert">
          {error}
        </div>
      )}

      <div className={styles.columns}>
        <form onSubmit={save} className={styles.formCard}>
          <h2 className={`${styles.formTitle} ${plexCondensed.className}`}>
            {isEditing ? "Editar perfil" : "Novo perfil"}
          </h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="userId">
              Usuário
            </label>
            <select
              id="userId"
              className={styles.input}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isEditing}
              required
            >
              <option value="">Selecione um usuário</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="fullName">
              Nome completo
            </label>
            <input
              id="fullName"
              className={styles.input}
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              minLength={2}
              maxLength={120}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="birthDate">
              Data de nascimento
            </label>
            <input
              id="birthDate"
              type="date"
              className={styles.input}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="avatarUrl">
              URL do avatar
            </label>
            <input
              id="avatarUrl"
              type="url"
              className={styles.input}
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? "Salvando..." : isEditing ? "Salvar" : "Cadastrar"}
            </button>
            {isEditing && (
              <button type="button" className={styles.btnSecondary} onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Avatar</span>
            <span>Nome completo</span>
            <span>Usuário</span>
            <span>Nascimento</span>
            <span style={{ textAlign: "right" }}>Ações</span>
          </div>

          {profiles.length === 0 && (
            <div className={styles.empty}>Nenhum perfil cadastrado.</div>
          )}

          {profiles.map((profile) => (
            <div key={profile.id} className={styles.row}>
              <Avatar name={profile.fullName} url={profile.avatarUrl} />
              <span className={styles.fullName}>{profile.fullName}</span>
              <div>
                <span className={styles.userName}>{profile.user.name}</span>
                <span className={styles.userEmail}>{profile.user.email}</span>
              </div>
              <span>{formatDate(profile.birthDate)}</span>
              <div className={styles.rowActions}>
                <button type="button" className={styles.btnEdit} onClick={() => edit(profile)}>
                  Editar
                </button>
                <button
                  type="button"
                  className={styles.btnDelete}
                  onClick={() => void remove(profile.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}