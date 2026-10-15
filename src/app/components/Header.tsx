"use client";

import Link from "next/link";
import { isAuthenticated } from "../login/auth_service";
import { useEffect, useState } from "react";

export default function Header() {

  const [autenticado, setAutenticado] = useState(false);

  useEffect(
    () => {
      setAutenticado(isAuthenticated());
    }, []
  );

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          Navbar
        </a>
        {!autenticado ? (
          <form className="d-flex">
            <Link href="/login" className="btn btn-outline-secondary mx-2">
              Login
            </Link>
            <Link href="/register" className="btn btn-outline-success">
              Register
            </Link>
          </form>
        ) : (
          <form className="d-flex">
            <Link href="/admin" className="btn btn-outline-secondary mx-2">
              Entrar
            </Link>
            <Link href="/logout" className="btn btn-outline-success">
              Logout
            </Link>
          </form>
        )}

      </div>
    </nav>
  );
}
