"use client";

import { useState } from "react";

type User = { id: number; name: string; email: string };

type Profile = {
  id: number;
  userId: number;
  fullName: string;
  birthDate: string | null; // formato "YYYY-MM-DD"
  avatarUrl: string | null;
};

type FormData = {
  id: number | null;
  userId: string;
  fullName: string;
  birthDate: string;
  avatarUrl: string;
};

const EMPTY_FORM: FormData = {
  id: null,
  userId: "",
  fullName: "",
  birthDate: "",
  avatarUrl: "",
};

// Dados mockados, só para visualização
const MOCK_USERS: User[] = [
  { id: 1, name: "Lucca Conto", email: "lucca@exemplo.com" },
  { id: 2, name: "Maria Silva", email: "maria@exemplo.com" },
  { id: 3, name: "João Souza", email: "joao@exemplo.com" },
];

const MOCK_PROFILES: Profile[] = [
  {
    id: 1,
    userId: 1,
    fullName: "Lucca Conto",
    birthDate: "2003-05-10",
    avatarUrl: null,
  },
  {
    id: 2,
    userId: 2,
    fullName: "Maria Silva",
    birthDate: "1998-11-22",
    avatarUrl: null,
  },
];

// Evita o problema de fuso: "1990-01-15" virando "14/01" no Brasil
function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
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
    return (
      <img
        src={url}
        alt={name}
        className="rounded-circle"
        style={{ width: 40, height: 40, objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
      style={{ width: 40, height: 40, fontSize: 14 }}
    >
      {getInitials(name)}
    </div>
  );
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const isEditing = form.id !== null;

  // Um usuário só pode ter um perfil (userId é único).
  // Ao editar, o usuário do próprio perfil continua disponível.
  const usersWithoutProfile = MOCK_USERS.filter(
    (user) =>
      !profiles.some((p) => p.userId === user.id) ||
      (isEditing && profiles.find((p) => p.id === form.id)?.userId === user.id)
  );

  function getUserName(userId: number) {
    return MOCK_USERS.find((u) => u.id === userId)?.name ?? "Usuário desconhecido";
  }

  function getUserEmail(userId: number) {
    return MOCK_USERS.find((u) => u.id === userId)?.email ?? "";
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isEditing) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === form.id
            ? {
                ...p,
                fullName: form.fullName,
                birthDate: form.birthDate || null,
                avatarUrl: form.avatarUrl || null,
              }
            : p
        )
      );
    } else {
      const newId = Math.max(0, ...profiles.map((p) => p.id)) + 1;
      setProfiles((prev) => [
        ...prev,
        {
          id: newId,
          userId: Number(form.userId),
          fullName: form.fullName,
          birthDate: form.birthDate || null,
          avatarUrl: form.avatarUrl || null,
        },
      ]);
    }

    setForm(EMPTY_FORM);
  }

  function handleEdit(profile: Profile) {
    setForm({
      id: profile.id,
      userId: String(profile.userId),
      fullName: profile.fullName,
      birthDate: profile.birthDate ?? "",
      avatarUrl: profile.avatarUrl ?? "",
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Excluir este perfil?")) return;
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (form.id === id) setForm(EMPTY_FORM);
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Perfis</h1>

      <div className="row g-4">
        {/* Formulário */}
        <div className="col-lg-4">
          <div className="card p-3">
            <h5 className="mb-3">
              {isEditing ? "Editar perfil" : "Novo perfil"}
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Usuário</label>
                <select
                  name="userId"
                  className="form-select"
                  value={form.userId}
                  onChange={handleChange}
                  disabled={isEditing}
                  required
                >
                  <option value="">Selecione um usuário</option>
                  {usersWithoutProfile.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Nome completo</label>
                <input
                  name="fullName"
                  type="text"
                  className="form-control"
                  placeholder="Nome completo"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Data de nascimento</label>
                <input
                  name="birthDate"
                  type="date"
                  className="form-control"
                  value={form.birthDate}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">URL do avatar</label>
                <input
                  name="avatarUrl"
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={form.avatarUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-dark">
                  {isEditing ? "Salvar alterações" : "Cadastrar"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setForm(EMPTY_FORM)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Lista */}
        <div className="col-lg-8">
          <div className="card p-3">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Nome completo</th>
                    <th>Usuário</th>
                    <th>Nascimento</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        Nenhum perfil cadastrado.
                      </td>
                    </tr>
                  )}

                  {profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td>
                        <Avatar
                          name={profile.fullName}
                          url={profile.avatarUrl}
                        />
                      </td>
                      <td>{profile.fullName}</td>
                      <td>
                        <div>{getUserName(profile.userId)}</div>
                        <small className="text-muted">
                          {getUserEmail(profile.userId)}
                        </small>
                      </td>
                      <td>{formatDate(profile.birthDate)}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark me-2"
                          onClick={() => handleEdit(profile)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(profile.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}