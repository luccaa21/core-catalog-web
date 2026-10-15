"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../login/auth_service";

export default function RootLayout({ children }: LayoutProps<"/">) {

    const router = useRouter();
    const [autenticado, setAutenticado] = useState(false);
    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/login");
            return;
        }
        setAutenticado(true);
    }, [router]);

    if (!autenticado) return null;

    return <>{children}</>;
}
