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
  { category: "RAM", name: "Vengeance DDR5 32 GB", price: "R$ 799,00" },
  { category: "Armazenamento", name: "990 PRO 1 TB NVMe", price: "R$ 749,00" },
];

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });

      if (!response.ok) {
        setError(await readApiError(response, "Não foi possível criar a conta."));
        return;
      }

      // O register já devolve o token, então o usuário entra direto
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
            title="Criar conta"
            subtitle="Monte builds dentro do orçamento e guarde todas elas em um só lugar."
            error={error}
            loading={loading}
            submitLabel="Criar conta"
            loadingLabel="Criando conta..."
            onSubmit={handleSubmit}
            alternative={{ text: "Já tem conta?", linkLabel: "Entrar", href: "/login" }}
          >
            <FormField label="Nome" htmlFor="name" size="lg" hint="Entre 3 e 100 caracteres">
              <Input
                id="name"
                name="name"
                type="text"
                size="lg"
                autoComplete="name"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={3}
                maxLength={100}
                required
              />
            </FormField>

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

            <FormField label="Senha" htmlFor="password" size="lg" hint="Mínimo de 6 caracteres">
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="••••••"
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
