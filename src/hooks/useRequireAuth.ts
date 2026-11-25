"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, isAuthenticated } from "@/lib/auth";

/**
 * Protege uma tela que exige login. Se não houver token, redireciona para /login
 * e volta para `nextPath` depois. `authed` só vira true no navegador, depois da checagem.
 */
export function useRequireAuth(nextPath: string) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    setAuthed(true);
  }, [nextPath, router]);

  /** Token expirado ou inválido: limpa a sessão e volta ao login. */
  const expireSession = useCallback(() => {
    clearToken();
    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
  }, [nextPath, router]);

  const logout = useCallback(() => {
    clearToken();
    router.push("/login");
  }, [router]);

  return { authed, expireSession, logout };
}
