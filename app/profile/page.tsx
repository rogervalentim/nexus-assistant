/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isAnalyst: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Employee | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("nexo_user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const emp = JSON.parse(stored) as Employee;
    setUser(emp);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("nexo_user");
    router.push("/login");
  };

  const handleResetPassword = () => {
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
    }, 5000);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0062C4] border-t-transparent" />
      </div>
    );
  }

  // Get user initials for avatar
  const initials = (() => {
    if (!user.name) return "U";
    const names = user.name.trim().split(/\s+/);
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  })();

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1B2430]">
      {/* Sidebar Lateral Esquerda */}
      <aside className="w-64 border-r border-[#E6E8ED] bg-white h-screen flex flex-col justify-between p-5 shrink-0">
        <div>
          {/* Logo */}
          <div className="mb-6 flex items-center gap-2">
            <Image
              src="/logo-2.png"
              alt="Nexo"
              width={128}
              height={20}
              priority
              className="h-auto w-auto"
            />
          </div>

          {/* Navegação */}
          <nav>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/chat"
                  className="flex items-center gap-2.5 h-10 px-3 rounded-lg text-[#5C6573] hover:text-[#1B2430] hover:bg-[#F8F9FA] font-medium text-[13.5px] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Atendimento
                </Link>
              </li>

              <li>
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 bg-[#0285F7]/10 h-10 px-3 rounded-lg text-[#006AC7] font-semibold text-[13.5px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Meu perfil
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Rodapé da Sidebar - Usuário & Logout */}
        <div>
          <div className="flex items-center gap-3 pt-4 border-t border-[#E6E8ED] mb-3">
            <div className="h-9 w-9 rounded-full bg-[#0285F7]/10 flex items-center justify-center text-[#006AC7] text-[13px] font-bold shrink-0">
              {initials}
            </div>
            <div className="text-left overflow-hidden flex-1">
              <p className="text-[13.5px] font-semibold text-[#1B2430] truncate">
                {user.name}
              </p>
              <p className="text-[11.5px] text-[#5C6573] truncate">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-[13px] font-medium text-[#5C6573] hover:text-red-600 cursor-pointer flex gap-2.5 items-center px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors"
          >
            <Image
              src="/logout.png"
              width={15}
              height={15}
              alt="Sair"
              className="opacity-70"
            />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden bg-white">
        {/* Cabeçalho Superior com Breadcrumb */}
        <header className="border-b border-[#E6E8ED] px-8 py-4 bg-white flex items-center shrink-0">
          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/chat"
              className="text-[#5C6573] hover:text-[#1B2430] transition-colors"
            >
              Service desk de TI
            </Link>
            <span className="text-[#5C6573]">›</span>
            <span className="text-[#1B2430] font-medium">Meu perfil</span>
          </div>
        </header>

        {/* Área Central do Perfil */}
        <div className="flex-1 overflow-y-auto px-6 py-12">
          <div className="max-w-160 w-full mx-auto">
            {/* Título e Subtítulo */}
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-[#1B2430] tracking-tight mb-1.5">
                Meu perfil
              </h1>
              <p className="text-[14px] text-[#5C6573]">
                Seus dados de acesso ao service desk de TI.
              </p>
            </div>

            {/* Card 1: Dados Pessoais (Nome e E-mail corporativo) */}
            <div className="rounded-2xl border border-[#E6E8ED] bg-white overflow-hidden mb-6 shadow-2xs">
              {/* Linha Nome */}
              <div className="px-6 py-4.5 flex items-center justify-between">
                <span className="text-[13.5px] text-[#5C6573] w-44 shrink-0 font-normal">
                  Nome
                </span>
                <span className="text-[14px] text-[#1B2430] font-medium flex-1">
                  {user.name}
                </span>
              </div>

              {/* Divisor */}
              <div className="border-t border-[#F0F2F5]" />

              {/* Linha E-mail Corporativo */}
              <div className="px-6 py-4.5 flex items-center justify-between">
                <span className="text-[13.5px] text-[#5C6573] w-44 shrink-0 font-normal">
                  E-mail corporativo
                </span>
                <span className="text-[14px] text-[#1B2430] font-medium flex-1 truncate pr-4">
                  {user.email}
                </span>
                <span className="text-[12.5px] text-[#5C6573] flex items-center gap-1.5 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Gerenciado pela TI
                </span>
              </div>
            </div>

            {/* Card 2: Senha & Redefinição */}
            <div className="rounded-2xl border border-[#E6E8ED] bg-white overflow-hidden shadow-2xs">
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Ícone de chave em círculo */}
                  <div className="h-10 w-10 rounded-full bg-[#F8F9FA] border border-[#E6E8ED] flex items-center justify-center text-[#5C6573] shrink-0">
                    <Image
                      src="/key.png"
                      width={18}
                      height={18}
                      alt="key icon"
                    />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#1B2430]">
                      Senha
                    </h3>
                    <p className="text-[12.5px] text-[#5C6573] mt-0.5">
                      Alterada há 42 dias
                    </p>
                  </div>
                </div>

                {/* Botão Redefinir senha */}
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="rounded-xl border border-[#E6E8ED] bg-white px-3.5 py-2 text-[13px] font-medium text-[#1B2430] hover:bg-[#F8F9FA] hover:border-[#D1D5DB] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Image
                    src="/password.png"
                    width={15}
                    height={15}
                    alt="password icon"
                  />
                  Redefinir senha
                </button>
              </div>

              {/* Mensagem de confirmação ao clicar */}
              {resetSent && (
                <div className="border-t border-[#00BD6B]/20 bg-[#00BD6B]/8 px-6 py-2.5 text-[12.5px] text-[#00804A] flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Link de redefinição enviado com sucesso para seu e-mail!
                </div>
              )}

              {/* Banner inferior informando envio de link */}
              <div className="border-t border-[#E6E8ED] bg-[#F8F9FA] px-6 py-3.5 flex items-center gap-2.5 text-[12.5px] text-[#5C6573]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>
                  Enviaremos um link de redefinição para{" "}
                  <strong className="font-semibold text-[#1B2430]">
                    {user.email}
                  </strong>
                  .
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
