"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "./auth_service";

export default function LoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState("");

    async function submitForm(event: any) {
        console.log(event)
        //pause a submissao do form - nao atualiza a page
        event.preventDefault();
        setErro("");

        //fazer uma request via http post para a api
       const resp = await fetch("http://localhost:3001/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: email, password: password
            })
        })
        if (!resp.ok) {
            var error = await resp.json();
            setErro(error.message);
            return;
        }
        const dados = await resp.json();
        console.log(dados.access_token);
        saveToken(dados.access_token);
        //redirecionar
        router.replace("/admin");
    }

    return (
        <div className="container py-5">
            <h1 className="mb-3">Login</h1>

            {erro != "" && (
                <p>{erro}</p>
            )}
            

            <form onSubmit={submitForm} className="card p-3">
                <div className="mb-3">
                    <label className="form-label">E-mail</label>
                    <input
                        onChange={(e)=> setEmail(e.target.value)}
                        type="email"
                        className="form-control"
                        placeholder="nome@exemplo.com"
                        required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Senha</label>
                    <div className="input-group">
                        <input
                            onChange={(e)=> setPassword(e.target.value)}
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            placeholder="••••••••"
                            required />
                        <div className="input-group-append">
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                                className="btn btn-outline-secondary">
                                {showPassword ? (
                                    <i className="bi bi-eye"></i>
                                ) : (
                                    <i className="bi bi-eye-slash"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <button className="btn btn-dark" type="submit">
                    Entrar
                </button>
            </form>
        </div>
    );
}