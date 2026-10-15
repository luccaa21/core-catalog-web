"use client";

import { useRouter } from "next/navigation";
import { getToken, isAuthenticated } from "@/app/login/auth_service";
import { useEffect, useState } from "react";

type User = { id: number; name: string; email: string };

const API = "http://localhost:3001/users";

export default function UsersPage() {

    const router = useRouter();

    const [id, setId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState("");

    const isEditing = id !== null;

    function authHeaders(): Record<string, string> {
        return { Authorization: `Bearer ${getToken()}` };
    }

    function resetForm() {
        setId(null);
        setName("");
        setEmail("");
        setPassword("");
    }

    function edit(user: User) {
        setId(user.id);
        setName(user.name);
        setEmail(user.email);
        setPassword("");
    }

    async function load() {
        try {
            const response = await fetch(API, { headers: authHeaders() });
            if (!response.ok) throw new Error();
            setUsers(await response.json());
        } catch {
            setError("Não foi possível carregar os usuários. Verifique a API.");
        }
    }

    async function save(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        // Na edição não envia senha; no cadastro, envia a senha em texto puro
        // (o backend gera o hash)
        const body: Record<string, string> = { name, email };
        if (!isEditing) body.password = password;

        try {
            const response = await fetch(isEditing ? `${API}/${id}` : API, {
                method: isEditing ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                setError(String(data?.message ?? "Erro ao salvar o usuário."));
                return;
            }

            resetForm();
            await load();
        } catch {
            setError("Erro de conexão ao salvar.");
        }
    }

    async function remove(userId: number) {
        if (!confirm("Excluir este usuário?")) return;
        try {
            const response = await fetch(`${API}/${userId}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            if (!response.ok) throw new Error();
            if (id === userId) resetForm();
            await load();
        } catch {
            setError("Não foi possível excluir o usuário.");
        }
    }

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/login");
            return;
        }
        void load();
    }, []);

    return (
        <main className="container py-4">
            <h1 className="h3 mb-4">Usuários</h1>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={save} className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="form-label" htmlFor="name">Nome</label>
                    <input
                        id="name"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label" htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {!isEditing && (
                    <div className="col-md-4">
                        <label className="form-label" htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required
                        />
                    </div>
                )}

                <div className="col-12 d-flex gap-2">
                    <button className="btn btn-primary" type="submit">
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </button>
                    {isEditing && (
                        <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div className="table-responsive">
                <table className="table table-striped align-middle">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th className="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td className="text-end">
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => edit(user)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => void remove(user.id)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}