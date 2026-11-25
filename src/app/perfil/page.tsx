"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { ProfileFields } from "@/components/profile/ProfileFields";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Form, FormActions } from "@/components/ui/Form";
import { PageHeading } from "@/components/ui/PageHeading";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch, readApiError, readJsonOrNull } from "@/lib/api";
import { getNextPath } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { authed, logout } = useRequireAuth("/perfil");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function fillForm(p: Profile | null) {
    setFullName(p?.fullName ?? "");
    setBirthDate(p?.birthDate ? p.birthDate.slice(0, 10) : "");
    setAvatarUrl(p?.avatarUrl ?? "");
  }

  useEffect(() => {
    if (!authed) return;

    async function load() {
      try {
        const response = await apiFetch("/profiles/me", { auth: true });
        if (!response.ok) throw new Error();

        // Sem perfil, o backend responde null (corpo vazio)
        const data = await readJsonOrNull<Profile>(response);
        setProfile(data);
        fillForm(data);
      } catch {
        setError("Não foi possível carregar seu perfil.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [authed]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    // Campos vazios não são enviados (undefined some no JSON)
    const fields = {
      fullName: fullName.trim(),
      birthDate: birthDate || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
    };

    setSaving(true);
    try {
      const response = await apiFetch(profile ? `/profiles/${profile.id}` : "/profiles/me", {
        method: profile ? "PATCH" : "POST",
        auth: true,
        body: fields,
      });

      if (!response.ok) {
        setError(await readApiError(response, "Não foi possível salvar o perfil."));
        return;
      }

      const saved: Profile = await response.json();
      setProfile(saved);
      fillForm(saved);

      // Se a pessoa veio de outra tela (ex.: Nova build), volta para ela
      const next = getNextPath("");
      if (next) {
        router.push(next);
        return;
      }
      setSuccess("Perfil salvo.");
    } catch {
      setError("Erro de conexão. Verifique se a API está rodando.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <AppHeader
        nav={[
          { label: "Catálogo", href: "/" },
          { label: "Builds", href: "/builds/new" },
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
                title="Meu perfil"
                subtitle={
                  profile
                    ? "Atualize seus dados. Eles aparecem nas builds que você montar."
                    : "Crie seu perfil para montar builds. Cada conta tem um único perfil."
                }
              />

              {error && <Alert>{error}</Alert>}
              {success && <Alert variant="notice">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <ProfileFields
                  fullName={fullName}
                  onFullNameChange={setFullName}
                  birthDate={birthDate}
                  onBirthDateChange={setBirthDate}
                  avatarUrl={avatarUrl}
                  onAvatarUrlChange={setAvatarUrl}
                  disabled={loading}
                  avatarHint="Opcional. Cole o link de uma imagem."
                />

                <FormActions>
                  <Button type="submit" disabled={saving || loading}>
                    {saving ? "Salvando..." : profile ? "Salvar alterações" : "Criar perfil"}
                  </Button>
                  <Button href="/" variant="secondary">
                    Cancelar
                  </Button>
                </FormActions>
              </Form>
            </>
          }
          preview={
            <ProfilePreview
              fullName={fullName}
              avatarUrl={avatarUrl}
              birthDate={birthDate}
              hasProfile={!!profile}
              loading={loading}
            />
          }
        />
      )}
    </PageShell>
  );
}
