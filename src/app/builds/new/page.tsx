"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NewBuildPreview } from "@/components/builds/NewBuildPreview";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Form, FormActions } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PageHeading } from "@/components/ui/PageHeading";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch, readApiError, readJsonOrNull } from "@/lib/api";
import type { Profile } from "@/lib/types";

export default function NewBuildPage() {
  const router = useRouter();
  const { authed, logout } = useRequireAuth("/builds/new");

  const [name, setName] = useState("");
  const [budgetCents, setBudgetCents] = useState(800000); // R$ 8.000,00
  const [myProfile, setMyProfile] = useState<Pick<Profile, "id" | "fullName"> | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authed) return;

    // Busca só o perfil da conta logada
    apiFetch("/profiles/me", { auth: true })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        // Sem perfil, o backend responde corpo vazio (null)
        setMyProfile(await readJsonOrNull(r));
      })
      .catch(() => setError("Não foi possível carregar seu perfil."))
      .finally(() => setProfileChecked(true));
  }, [authed]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!myProfile) {
      setError("Crie seu perfil antes de montar uma build.");
      return;
    }
    if (budgetCents <= 0) {
      setError("Informe um orçamento maior que zero.");
      return;
    }

    setSaving(true);
    try {
      // O perfil não é enviado: o backend usa o dono do token
      const response = await apiFetch("/builds", {
        method: "POST",
        auth: true,
        body: { name: name.trim(), maxBudgetCents: budgetCents },
      });

      if (!response.ok) {
        setError(await readApiError(response, "Não foi possível criar a build."));
        return;
      }

      const created = await response.json();
      router.push(`/builds/${created.id}`);
    } catch {
      setError("Erro de conexão. Verifique se a API está rodando.");
    } finally {
      setSaving(false);
    }
  }

  const profileLabel = myProfile
    ? myProfile.fullName
    : profileChecked
      ? "Você ainda não tem perfil"
      : "Carregando...";

  return (
    <PageShell>
      <AppHeader
        nav={[
          { label: "Catálogo", href: "/" },
          { label: "Builds", href: "/builds", strong: true },
        ]}
      >
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
        <Button href="/">Catálogo</Button>
      </AppHeader>

      {authed && (
        <SplitLayout
          variant="builder"
          form={
            <>
              <PageHeading
                title="Nova build"
                subtitle="Defina o orçamento. Cada peça adicionada é conferida contra esse limite."
              />

              {error && <Alert>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <FormField label="Nome da build" htmlFor="name">
                  <Input
                    id="name"
                    placeholder="Ex.: PC Gamer 2026"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </FormField>

                <FormField
                  label="Orçamento máximo"
                  htmlFor="budget"
                  hint="Peças que ultrapassem esse valor não serão adicionadas."
                >
                  <CurrencyInput
                    id="budget"
                    cents={budgetCents}
                    onChangeCents={setBudgetCents}
                    required
                  />
                </FormField>

                <FormField
                  label="Perfil"
                  htmlFor="profile"
                  hint={
                    profileChecked && !myProfile ? (
                      <Link href="/perfil?next=/builds/new">
                        Criar meu perfil
                      </Link>
                    ) : undefined
                  }
                >
                  <Input id="profile" value={profileLabel} disabled />
                </FormField>

                <FormActions>
                  <Button type="submit" disabled={saving || !myProfile}>
                    {saving ? "Criando..." : "Criar build"}
                  </Button>
                  <Button variant="secondary" onClick={() => router.push("/")}>
                    Cancelar
                  </Button>
                </FormActions>
              </Form>
            </>
          }
          preview={<NewBuildPreview name={name} budgetCents={budgetCents} />}
        />
      )}
    </PageShell>
  );
}
