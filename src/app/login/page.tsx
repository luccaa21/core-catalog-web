"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { BuildPreview, type PreviewItem } from "@/components/auth/BuildPreview";
import { PageShell } from "@/components/layout/PageShell";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { apiFetch, readApiError } from "@/lib/api";
import { getNextPath, saveToken } from "@/lib/auth";

const PREVIEW_ITEMS: PreviewItem[] = [
  { category: "CPU", name: "Ryzen 7 7800X3D", price: "R$ 1.899,00" },
  { category: "GPU", name: "GeForce RTX 4070 Super", price: "R$ 4.299,00" },
  { category: "RAM", name: "Corsair Vengeance DDR5 32 GB", price: "R$ 799,00" },
  { category: "Armazenamento", name: "Samsung 990 PRO 1 TB", price: "R$ 749,00" },
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (!response.ok) {
        setError(await readApiError(response, "Não foi possível entrar."));
        return;
      }

      const data = await response.json();
      saveToken(data.access_token);
      router.replace(getNextPath());
    } catch {
      setError("Erro de conexão. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell centered>
      <SplitLayout
        variant="auth"
        form={
          <AuthForm
            title="Entrar"
            subtitle="Acesse sua conta para montar e salvar builds."
            error={error}
            loading={loading}
            submitLabel="Entrar"
            loadingLabel="Entrando..."
            onSubmit={handleSubmit}
            alternative={{ text: "Ainda não tem conta?", linkLabel: "Criar conta", href: "/register" }}
          >
            <FormField label="E-mail" htmlFor="email" size="lg">
              <Input
                id="email"
                name="email"
                type="email"
                size="lg"
                autoComplete="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Senha" htmlFor="password" size="lg">
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </FormField>
          </AuthForm>
        }
        preview={<BuildPreview items={PREVIEW_ITEMS} />}
      />
    </PageShell>
  );
}
