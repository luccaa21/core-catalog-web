"use client";

import { useEffect, useState } from "react";
import { AdminFormCard, AdminSplit } from "@/components/admin/AdminSplit";
import { ProfileFields } from "@/components/profile/ProfileFields";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { FormField } from "@/components/ui/FormField";
import { PageHeading } from "@/components/ui/PageHeading";
import { Select } from "@/components/ui/Input";
import { RowActions } from "@/components/ui/RowActions";
import { Table, TableEmpty, TableHead, TableRow } from "@/components/ui/Table";
import { apiFetch, readApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ProfileWithUser, User } from "@/lib/types";
import styles from "./profiles.module.css";

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileWithUser[]>([]);
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
        apiFetch("/profiles", { auth: true }),
        apiFetch("/users", { auth: true }),
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

  function edit(profile: ProfileWithUser) {
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
      const response = await apiFetch(isEditing ? `/profiles/${id}` : "/profiles", {
        method: isEditing ? "PATCH" : "POST",
        auth: true,
        body,
      });

      if (!response.ok) {
        setError(await readApiError(response, "Erro ao salvar o perfil."));
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
      const response = await apiFetch(`/profiles/${profileId}`, { method: "DELETE", auth: true });
      if (!response.ok) throw new Error();
      if (id === profileId) resetForm();
      await load();
    } catch {
      setError("Não foi possível excluir o perfil.");
    }
  }

  return (
    <>
      <PageHeading title="Perfis" />

      {error && <Alert spaced>{error}</Alert>}

      <AdminSplit
        form={
          <AdminFormCard
            title={isEditing ? "Editar perfil" : "Novo perfil"}
            onSubmit={save}
            saving={saving}
            submitLabel={isEditing ? "Salvar" : "Cadastrar"}
            savingLabel="Salvando..."
            onCancel={isEditing ? resetForm : undefined}
          >
            <FormField label="Usuário" htmlFor="userId">
              <Select
                id="userId"
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
              </Select>
            </FormField>

            <ProfileFields
              fullName={fullName}
              onFullNameChange={setFullName}
              birthDate={birthDate}
              onBirthDateChange={setBirthDate}
              avatarUrl={avatarUrl}
              onAvatarUrlChange={setAvatarUrl}
            />
          </AdminFormCard>
        }
      >
        <Table>
          <TableHead className={styles.cols}>
            <span>Avatar</span>
            <span>Nome completo</span>
            <span>Usuário</span>
            <span>Nascimento</span>
            <span style={{ textAlign: "right" }}>Ações</span>
          </TableHead>

          {profiles.length === 0 && <TableEmpty>Nenhum perfil cadastrado.</TableEmpty>}

          {profiles.map((profile) => (
            <TableRow key={profile.id} className={`${styles.cols} ${styles.rowText}`}>
              <Avatar name={profile.fullName} url={profile.avatarUrl} />
              <span className={styles.fullName}>{profile.fullName}</span>
              <div>
                <span className={styles.userName}>{profile.user.name}</span>
                <span className={styles.userEmail}>{profile.user.email}</span>
              </div>
              <span>{formatDate(profile.birthDate)}</span>
              <RowActions onEdit={() => edit(profile)} onDelete={() => void remove(profile.id)} />
            </TableRow>
          ))}
        </Table>
      </AdminSplit>
    </>
  );
}
