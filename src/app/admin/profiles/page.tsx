"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, isAuthenticated } from "@/app/login/auth_service";

const API = "http://localhost:3001";

type User = { id: number; name: string; email: string };

type Profile = {
  id: number;
  userId: number;
  fullName: string;
  birthDate: string | null; // vem como ISO: "2003-05-10T00:00:00.000Z"
  avatarUrl: string | null;
  user: { name: string; email: string };
};

type FormData = {
  id: number | null;
  userId: string;
  fullName: string;
  birthDate: string; // "YYYY-MM-DD" (input type="date")
  avatarUrl: string;
};

const EMPTY_FORM: FormData = {
  id: null,
  userId: "",
  fullName: "",
  birthDate: "",
  avatarUrl: "",
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
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState("");

  const isEditing = form.id !== null;

  // Um usuário só pode ter um perfil. Ao editar, o usuário do próprio perfil continua na lista.
  const usersWithoutProfile = users.filter(
    (user) =>
      !profiles.some((p) => p.userId === user.id) ||
      (isEditing && profiles.find((p) => p.id === form.id)?.userId === user.id)
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
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    void load();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Campos vazios não são enviados (undefined some no JSON)
    const fields = {
      fullName: form.fullName,
      birthDate: form.birthDate || undefined,
      avatarUrl: form.avatarUrl || undefined,
    };

    const url = isEditing ? `${API}/profiles/${form.id}` : `${API}/profiles`;
    const body = isEditing ? fields : { userId: Number(form.userId), ...fields };

    try {
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setError(String(msg ?? "Erro ao salvar o perfil."));
        return;
      }

      setForm(EMPTY_FORM);
      await load();
    } catch {
      setError("Erro de conexão ao salvar.");
    }
  }

  function handleEdit(profile: Profile) {
    setForm({
      id: profile.id,
      userId: String(profile.userId),
      fullName: profile.fullName,
      birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : "",
      avatarUrl: profile.avatarUrl ?? "",
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este perfil?")) return;
    try {
      const response = await fetch(`${API}/profiles/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error();
      if (form.id === id) setForm(EMPTY_FORM);
      await load();
    } catch {
      setError("Não foi possível excluir o perfil.");
    }
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Perfis</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Formulário */}
        <div className="col-lg-4">
          <div className="card p-3">
            <h5 className="mb-3">{isEditing ? "Editar perfil" : "Novo perfil"}</h5>

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
                  minLength={2}
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
                        <Avatar name={profile.fullName} url={profile.avatarUrl} />
                      </td>
                      <td>{profile.fullName}</td>
                      <td>
                        <div>{profile.user.name}</div>
                        <small className="text-muted">{profile.user.email}</small>
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
                          onClick={() => void handleDelete(profile.id)}
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