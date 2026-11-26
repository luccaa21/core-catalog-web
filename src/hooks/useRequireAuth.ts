"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, isAuthenticated } from "@/lib/auth";

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
