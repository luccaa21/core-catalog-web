"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../login/auth_service";

export default function Admin() {

    return (
        <div className="container">
            <ul>
                <li>
                    <h1>Admin</h1>
                </li>
                <li>
                    <Link href="/admin/users">Gerenciar Usuários</Link>
                </li>
                <li>
                    <Link href="/admin/profiles">Gerenciar Perfis</Link>
                </li>
                <li>
                    <Link href="/logout">Logout</Link>
                </li>
            </ul>
        </div>
    );
}
