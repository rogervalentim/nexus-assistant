"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isAnalyst: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 1. Estado para controlar visibilidade
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          employee?: Employee;
          error?: string;
        };

        if (!res.ok || !data.success || !data.employee) {
          setError(data.error ?? "Credenciais inválidas.");
          return;
        }

        // Store user info in sessionStorage
        sessionStorage.setItem("nexo_user", JSON.stringify(data.employee));

        // Redirect based on role
        if (data.employee.isAnalyst) {
          router.push("/analyst");
        } else {
          router.push("/chat");
        }
      } catch {
        setError("Erro de conexão. Verifique sua internet e tente novamente.");
      }
    });
  };

  return (
    <div className="flex justify-center items-center">
      <div className="flex justify-center flex-col">
        <h2 className="text-[#1B2430] text-[40px] font-regular font-newsreader leading-[110%] tracking-[-0.8px] mb-2">
          Entrar
        </h2>

        <p className="text-[15.5px] font-regular text-[#5C6573] leading-[150%] mb-7">
          Use seu e-mail corporativo e a senha da rede Nexo.
        </p>

        <form
          onSubmit={handleSubmit}
          className="border-b border-[#E6E8ED] pb-7 mb-10 lg:mb-52.75"
        >
          {/* Campo E-mail */}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-[13.5px] font-medium text-[#1B2430] mb-2"
            >
              E-mail Corporativo
            </label>

            <div className="relative w-full max-w-95 flex items-center mb-4.5">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@nexo.com.br"
                required
                disabled={isPending}
                className="peer w-full h-11 pl-9 pr-3 border border-[#1B2431]/12 rounded-lg text-[#1B2430] font-regular text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[#0062C4]"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 pointer-events-none z-10 text-[#4A5568] transition-colors peer-focus:text-[#0062C4]"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
          </div>

          {/* Campo Senha */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center w-full max-w-95 mb-2">
              <label
                htmlFor="password"
                className="text-[13.5px] font-medium text-[#1B2430]"
              >
                Senha
              </label>

              <a
                href="#"
                className="text-[13.5px] font-medium text-[#006AC7] hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>
            <div className="relative w-full max-w-95 flex items-center mb-4.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"} // 2. Tipo dinâmico
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="peer w-full h-11 pl-9 pr-10 border border-[#1B2431]/12 rounded-lg text-[#1B2430] font-regular text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[#0062C4]"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 pointer-events-none z-10 text-[#4A5568] transition-colors peer-focus:text-[#0062C4]"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>

              {/* 3. Botão do olho com alternância de ícone */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                className="absolute right-3 z-10 text-[#4A5568] hover:text-[#0062C4] transition-colors focus:outline-none"
              >
                {showPassword ? (
                  /* Ícone Olho Riscado (Senha Visível) */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  /* Ícone Olho Aberto (Senha Oculta) */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="flex items-center gap-2.25 mb-7">
            <input
              type="checkbox"
              name="checkbox"
              id="checkbox"
              className="h-4 w-4 appearance-none rounded-md border border-gray-400 bg-white bg-center bg-no-repeat transition-all checked:border-[#0062C4] checked:bg-[#0062C4] checked:bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%223.5%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><path%20d=%22M3.5%2012.5L9.5%2018.5L20.5%205.5%22/></svg>')] cursor-pointer"
            />
            <label
              htmlFor="checkbox"
              className="text-[13.5px] font-regular text-[#3E4757]"
            >
              Manter conectado neste computador
            </label>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={isPending || !email || !password}
            className="w-full max-w-95 rounded-xl bg-[#0062C4] px-4 py-[12.5px] font-semibold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Autenticando...
              </span>
            ) : (
              <div className="flex gap-2 justify-center items-center">
                Entrar
                <Image src="/arrow.png" alt="Seta" width={16} height={16} />
              </div>
            )}
          </button>
        </form>

        {/* Contas de Teste Rápidas */}
        <div className="w-full max-w-95 -mt-4 pb-6">
          <p className="text-[12px] font-medium text-[#5C6573] mb-2">
            Acesso Rápido de Demonstração:
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail("ana.silva@nexo.com.br");
                setPassword("teste123");
              }}
              className="w-full text-left p-2 rounded-lg border border-[#E6E8ED] bg-[#F8F9FA] hover:bg-white hover:border-[#0062C4] transition-all text-xs text-[#1B2430] flex items-center justify-between cursor-pointer"
            >
              <span>
                <strong>Ana Silva</strong> (Design UI/UX)
              </span>
              <span className="text-[#0062C4] text-[11px] font-medium">Usar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("carlos.mendes@nexo.com.br");
                setPassword("teste123");
              }}
              className="w-full text-left p-2 rounded-lg border border-[#E6E8ED] bg-[#F8F9FA] hover:bg-white hover:border-[#0062C4] transition-all text-xs text-[#1B2430] flex items-center justify-between cursor-pointer"
            >
              <span>
                <strong>Carlos Mendes</strong> (Analista N2)
              </span>
              <span className="text-[#0062C4] text-[11px] font-medium">Usar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
