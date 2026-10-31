/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Session, Ticket } from "@/lib/types";
import Image from "next/image";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isAnalyst: boolean;
}

type SessionSummary = {
  id: string;
  userEmail: string;
  userName: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  escalationReason?: string;
  analystId?: string;
  lastMessage?: string;
};

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  "ana.silva@nexo.com.br": { bg: "bg-[#EBF4FF]", text: "text-[#0062C4]" },
  "carlos.monteiro@nexo.com.br": { bg: "bg-[#FFF4ED]", text: "text-[#D97706]" },
  "beatriz.torres@nexo.com.br": { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]" },
  "diego.ramos@nexo.com.br": { bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
  "carla.dias@nexo.com.br": { bg: "bg-[#FDF2F8]", text: "text-[#DB2777]" },
  "paulo.souza@nexo.com.br": { bg: "bg-[#F3F4F6]", text: "text-[#4B5563]" },
  "fernanda.rocha@nexo.com.br": { bg: "bg-[#FEFCE8]", text: "text-[#CA8A04]" },
};

const EMPLOYEE_METAS: Record<
  string,
  {
    role: string;
    ramal: string;
    time: string;
    badge: string;
    badgeColor: string;
    unread?: number;
  }
> = {
  "ana.silva@nexo.com.br": {
    role: "Design UI/UX",
    ramal: "ramal 4120",
    time: "14:48",
    badge: "Aguardando atendimento",
    badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
  },
  "carlos.monteiro@nexo.com.br": {
    role: "Vendas",
    ramal: "ramal 3210",
    time: "14:32",
    badge: "Em andamento (você)",
    badgeColor: "text-[#0062C4] bg-blue-50 border-blue-200",
    unread: 1,
  },
  "beatriz.torres@nexo.com.br": {
    role: "Financeiro",
    ramal: "ramal 1150",
    time: "12:15",
    badge: "Aguardando atendimento",
    badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
  },
  "diego.ramos@nexo.com.br": {
    role: "Engenharia",
    ramal: "ramal 5540",
    time: "11:05",
    badge: "Aguardando atendimento",
    badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
  },
  "carla.dias@nexo.com.br": {
    role: "RH",
    ramal: "ramal 2100",
    time: "10:20",
    badge: "Finalizado",
    badgeColor: "text-gray-600 bg-gray-100 border-gray-200",
  },
  "paulo.souza@nexo.com.br": {
    role: "Operações",
    ramal: "ramal 6120",
    time: "09:45",
    badge: "Finalizado",
    badgeColor: "text-gray-600 bg-gray-100 border-gray-200",
  },
  "fernanda.rocha@nexo.com.br": {
    role: "Marketing",
    ramal: "ramal 3340",
    time: "Ontem",
    badge: "Finalizado",
    badgeColor: "text-gray-600 bg-gray-100 border-gray-200",
  },
};

export default function AnalystPageClient() {
  const router = useRouter();
  const [analyst, setAnalyst] = useState<Employee | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [analystReply, setAnalystReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-login or verify
  useEffect(() => {
    const stored = sessionStorage.getItem("nexo_user");
    if (!stored) {
      const defaultAnalyst: Employee = {
        id: "ana-002",
        name: "Carlos Mendes",
        email: "carlos.mendes@nexo.com.br",
        department: "Service Desk",
        role: "Analista N2",
        isAnalyst: true,
      };
      sessionStorage.setItem("nexo_user", JSON.stringify(defaultAnalyst));
      setAnalyst(defaultAnalyst);
      return;
    }
    const emp = JSON.parse(stored) as Employee;
    setAnalyst(emp);
  }, [router]);

  // Select a session — load full detail
  const selectSession = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const data = (await res.json()) as { session: Session };
      if (data.session) {
        setSelected(data.session);
        const tRes = await fetch(
          `/api/tickets?userEmail=${encodeURIComponent(data.session.userEmail)}`,
        );
        const tData = (await tRes.json()) as { tickets: Ticket[] };
        setUserTickets(tData.tickets ?? []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      const data = (await res.json()) as { sessions: SessionSummary[] };
      const sessList = data.sessions ?? [];
      setSessions(sessList);

      // Auto-select Ana Silva if available, or first
      if (!selected && sessList.length > 0) {
        const ana =
          sessList.find((s) => s.userEmail === "ana.silva@nexo.com.br") ||
          sessList[0];
        selectSession(ana.id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [selected, selectSession]);

  useEffect(() => {
    if (!analyst) return;
    fetchSessions();
    const iv = setInterval(fetchSessions, 5000);
    return () => clearInterval(iv);
  }, [analyst, fetchSessions]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  // Actions: assume, return, close
  const handleAction = async (action: "assume" | "return" | "close") => {
    if (!selected || !analyst) return;
    setActionLoading(true);

    try {
      let newStatus = selected.status;
      let analystId = selected.analystId;

      if (action === "assume") {
        newStatus = "with_analyst";
        analystId = analyst.id;
      } else if (action === "return") {
        newStatus = "active";
        analystId = undefined;
      } else if (action === "close") {
        newStatus = "closed";
      }

      const res = await fetch(`/api/sessions/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, analystId }),
      });
      const data = (await res.json()) as { session?: Session };
      if (data.session) {
        setSelected(data.session);
        fetchSessions();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  // Analyst sends a message
  const sendAnalystMessage = async () => {
    if (!selected || !analyst || !analystReply.trim() || sendingReply) return;
    const content = analystReply.trim();
    setAnalystReply("");
    setSendingReply(true);

    try {
      const res = await fetch(`/api/sessions/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          role: "assistant",
          senderName: `${analyst.name} (Analista TI)`,
        }),
      });
      const data = (await res.json()) as { session?: Session };
      if (data.session) {
        setSelected(data.session);
        fetchSessions();
      }
    } catch {
      // ignore
    } finally {
      setSendingReply(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("nexo_user");
    router.push("/login");
  };

  if (!analyst) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0062C4] border-t-transparent" />
      </div>
    );
  }

  // Filter & Search
  const filteredSessions = sessions.filter((s) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "waiting" && s.status === "waiting_analyst") ||
      (filter === "in_progress" && s.status === "with_analyst") ||
      (filter === "resolved" && s.status === "closed");

    const matchesSearch =
      !searchQuery.trim() ||
      s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeTicket =
    userTickets.find((t) => t.id === "INC-2024-001") || userTickets[0];
  const otherTickets = userTickets.filter((t) => t.id !== activeTicket?.id);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1B2430] overflow-hidden font-sans">
      {/* ─── Far-left Slim Icon Bar ─── */}
      <aside className="w-14 shrink-0 border-r border-[#E6E8ED] bg-white flex flex-col items-center justify-between py-3 z-20">
        <div className="flex flex-col items-center gap-5">
          {/* Nexo Logo 'N' */}
          <Image src="/n-logo.png" alt="logo" width={24} height={20} />

          {/* Active Chat Bubble Icon with badge count */}
          <div className="relative">
            <button
              title="Conversas"
              className="h-9 w-9 rounded-xl bg-[#0285F7]/12 text-[#0062C4] flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#0062C4] text-white text-[10px] font-bold flex items-center justify-center">
              4
            </span>
          </div>
        </div>

        {/* Bottom Profile & Status Dot */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-[#0285F7]/10 text-[#0062C4] font-bold text-xs flex items-center justify-center border border-[#0285F7]/20">
              {analyst.name.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Image
              src="/logout.png"
              width={14}
              height={14}
              alt="Sair"
              className="opacity-70"
            />
          </button>
        </div>
      </aside>

      {/* ─── Column 1: "Conversas" List ─── */}
      <section className="w-80 shrink-0 border-r border-[#E6E8ED] bg-white flex flex-col h-screen">
        {/* Top Header */}
        <div className="p-3.5 border-b border-[#E6E8ED]">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[17px] font-bold text-[#1B2430] tracking-tight">
              Conversas
            </h2>
            <button className="text-[12px] font-semibold text-[#00804A] hover:underline flex items-center gap-1 cursor-pointer">
              + Novo chamado
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mb-2.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por funcionário ou chamado..."
              className="w-full h-8.5 pl-8 pr-3 rounded-lg border border-[#E6E8ED] bg-[#F8F9FA] text-[12.5px] text-[#1B2430] placeholder:text-[#9AA3AF] outline-none focus:border-[#0062C4] focus:bg-white transition-all"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#9AA3AF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-[11px] font-medium overflow-x-auto pb-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-[#0062C4] text-white font-semibold"
                  : "bg-gray-100 text-[#5C6573] hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("waiting")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === "waiting"
                  ? "bg-[#0062C4] text-white font-semibold"
                  : "bg-gray-100 text-[#5C6573] hover:bg-gray-200"
              }`}
            >
              Fila (2)
            </button>
            <button
              onClick={() => setFilter("in_progress")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === "in_progress"
                  ? "bg-[#0062C4] text-white font-semibold"
                  : "bg-gray-100 text-[#5C6573] hover:bg-gray-200"
              }`}
            >
              Em andamento (1)
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === "resolved"
                  ? "bg-[#0062C4] text-white font-semibold"
                  : "bg-gray-100 text-[#5C6573] hover:bg-gray-200"
              }`}
            >
              Resolvidos
            </button>
          </div>
        </div>

        {/* List of Conversations */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F0F2F5]">
          {loading && sessions.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0062C4] border-t-transparent" />
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isSelected = selected?.id === s.id;
              const meta = EMPLOYEE_METAS[s.userEmail.toLowerCase()] || {
                role: "Colaborador",
                ramal: "ramal TI",
                time: "Hoje",
                badge:
                  s.status === "waiting_analyst"
                    ? "Aguardando atendimento"
                    : "Finalizado",
                badgeColor: "text-gray-600 bg-gray-100 border-gray-200",
              };
              const color = AVATAR_COLORS[s.userEmail.toLowerCase()] || {
                bg: "bg-blue-50",
                text: "text-blue-600",
              };

              const names = s.userName.trim().split(/\s+/);
              const initials =
                names.length === 1
                  ? names[0].charAt(0).toUpperCase()
                  : (
                      names[0].charAt(0) + names[names.length - 1].charAt(0)
                    ).toUpperCase();

              return (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`p-3 transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? "bg-[#0285F7]/8 border-l-3 border-l-[#0062C4]"
                      : "hover:bg-[#F8F9FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-full ${color.bg} ${color.text} font-bold text-xs flex items-center justify-center shrink-0`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[13px] text-[#1B2430] truncate">
                          {s.userName}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#5C6573] truncate">
                        {meta.role} · {meta.ramal}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium border ${meta.badgeColor}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              meta.badge.includes("Aguardando")
                                ? "bg-amber-500"
                                : meta.badge.includes("andamento")
                                  ? "bg-[#0062C4]"
                                  : "bg-gray-400"
                            }`}
                          />
                          {meta.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[11px] text-[#9AA3AF]">
                      {meta.time}
                    </span>
                    {meta.unread && (
                      <span className="h-4.5 w-4.5 rounded-full bg-[#0062C4] text-white text-[10px] font-bold flex items-center justify-center">
                        {meta.unread}
                      </span>
                    )}
                    {isSelected && (
                      <span className="h-5 w-5 rounded-full bg-[#0062C4] text-white flex items-center justify-center text-[10px] font-bold">
                        ›
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ─── Column 2: Active Chat Window (Exact Dialog from Screenshot) ─── */}
      {selected ? (
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white border-r border-[#E6E8ED]">
          {/* Header */}
          <header className="border-b border-[#E6E8ED] bg-white px-5 py-3 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#EBF4FF] text-[#0062C4] font-bold text-xs flex items-center justify-center shrink-0">
                AS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-[15px] text-[#1B2430]">
                    {selected.userName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-amber-50 border-amber-200 text-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Aguardando atendimento
                  </span>
                </div>
                <p className="text-[11.5px] text-[#5C6573]">
                  Design UI/UX · ramal 4120
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
              <button
                title="Buscar na conversa"
                className="hover:text-gray-600 cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button
                title="Opções"
                className="hover:text-gray-600 font-bold text-base cursor-pointer"
              >
                ⋮
              </button>
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3.5 bg-[#F8F9FA]">
            {/* Date divider */}
            <div className="flex items-center justify-center my-2">
              <span className="text-[11px] font-medium text-gray-400 bg-white border border-[#E6E8ED] px-3 py-0.5 rounded-full shadow-2xs">
                Hoje
              </span>
            </div>

            {(selected.messages ?? []).map((msg, idx) => {
              const isUser = msg.role === "user";
              const timeStr = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "14:40";

              return (
                <div
                  key={msg.id || idx}
                  className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3.5 shadow-2xs text-[13px] leading-relaxed ${
                      isUser
                        ? "bg-white border border-[#E6E8ED] text-[#1B2430] rounded-tl-xs"
                        : "bg-[#EBF5FF] border border-[#BFDBFE] text-[#1E3A8A] rounded-tr-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    <div
                      className={`text-[10px] mt-1 flex items-center gap-1 ${
                        isUser
                          ? "justify-start text-gray-400"
                          : "justify-end text-blue-500 font-medium"
                      }`}
                    >
                      {!isUser && <span>Nexo Assist ·</span>}
                      <span>{timeStr}</span>
                      {!isUser && <span>✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Transfer Separator */}
            <div className="my-5 flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-[#E6E8ED]" />
              <span className="text-[11.5px] font-medium text-gray-400 px-3">
                Atendimento transferido para a fila humana
              </span>
              <div className="h-px flex-1 bg-[#E6E8ED]" />
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Bottom Action Box ─── */}
          <div className="border-t border-[#E6E8ED] bg-white p-3.5">
            {selected.status === "waiting_analyst" ? (
              /* Amber Alert Box matching Screen */
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-[#FFFBEB] p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm">
                      😊
                    </div>
                    <div>
                      <p className="font-semibold text-[13px] text-amber-900 leading-tight">
                        Ana aguarda atendimento
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Agente pausado às 14:43
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction("return")}
                      disabled={actionLoading}
                      className="rounded-lg border border-[#E6E8ED] bg-white px-3 py-1.5 text-xs font-medium text-[#3E4757] hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      ↻ Devolver ao agent
                    </button>

                    <button
                      onClick={() => handleAction("assume")}
                      disabled={actionLoading}
                      className="rounded-lg bg-[#0062C4] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0051a3] transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      🤝 Assumir atendimento
                    </button>
                  </div>
                </div>

                {/* Disabled input prompt */}
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    placeholder="Assuma o atendimento para responder"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E6E8ED] bg-[#F8F9FA] text-[13px] text-gray-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            ) : selected.status === "with_analyst" ? (
              /* Active Chat Input */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11.5px] text-[#5C6573] px-1">
                  <span className="flex items-center gap-1.5 text-[#0062C4] font-medium">
                    <span className="h-2 w-2 rounded-full bg-[#0062C4]" />
                    Você está atendendo {selected.userName} diretamente
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction("return")}
                      disabled={actionLoading}
                      className="hover:text-[#1B2430] cursor-pointer"
                    >
                      Devolver ao agent
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => handleAction("close")}
                      disabled={actionLoading}
                      className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
                    >
                      Encerrar
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={analystReply}
                    onChange={(e) => setAnalystReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendAnalystMessage();
                    }}
                    placeholder={`Digite uma mensagem para ${selected.userName}... (Enter para enviar)`}
                    className="flex-1 rounded-xl border border-[#E6E8ED] bg-[#F8F9FA] px-4 py-2 text-[13px] text-[#1B2430] outline-none focus:border-[#0062C4] focus:bg-white"
                  />
                  <button
                    onClick={sendAnalystMessage}
                    disabled={!analystReply.trim() || sendingReply}
                    className="rounded-xl bg-[#0062C4] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0051a3] disabled:opacity-50 cursor-pointer"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-100 p-2.5 text-center text-xs text-gray-500 font-medium">
                Atendimento finalizado.
              </div>
            )}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Selecione uma conversa.
        </div>
      )}

      {/* ─── Column 3: "Chamados de Ana" (Right Panel) ─── */}
      {showRightPanel && (
        <aside className="w-80 shrink-0 border-l border-[#E6E8ED] bg-white flex flex-col h-screen overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-[#E6E8ED] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[15px] text-[#1B2430]">
                Chamados de Ana
              </h3>
              <p className="text-[11.5px] text-[#5C6573]">
                4 chamados · 1 em andamento
              </p>
            </div>
            <button
              onClick={() => setShowRightPanel(false)}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-5 flex-1 overflow-y-auto">
            {/* Section 1: Em andamento */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Em andamento
              </p>

              <div className="rounded-xl border border-amber-200 bg-[#FFFBEB] p-3.5 shadow-2xs">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-xs font-semibold text-[#1B2430]">
                    INC-2024-001
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                    ⚠️ ABERTO (SLA - 01:22)
                  </span>
                </div>

                <h4 className="font-bold text-[13px] text-[#1B2430] mb-0.5 leading-snug">
                  Notebook lento após atualização
                </h4>
                <p className="text-[11.5px] text-gray-500 mb-2.5">
                  Hardware · Adicionado ontem
                </p>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-gray-600">
                  <span className="flex items-center gap-1">
                    👤 Transferido para você · ramal 4120
                  </span>
                  <span className="text-gray-400">há 1h</span>
                </div>
              </div>
            </div>

            {/* Section 2: Demais chamados */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Demais chamados
              </p>

              <div className="space-y-2">
                {/* Item 1 */}
                <div className="rounded-xl border border-[#E6E8ED] bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded-md bg-blue-50 text-[#0062C4] flex items-center justify-center text-xs shrink-0">
                      📂
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[12.5px] text-[#1B2430] truncate">
                        Acesso à pasta Financeiro
                      </p>
                      <p className="text-[11px] text-gray-500">
                        SharePoint · Em andamento
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">›</span>
                </div>

                {/* Item 2 */}
                <div className="rounded-xl border border-[#E6E8ED] bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                      🖥️
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[12.5px] text-[#1B2430] truncate">
                        Segundo monitor para home office
                      </p>
                      <p className="text-[11px] text-gray-500">
                        REQ-2024-003 · Aprovado
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">›</span>
                </div>

                {/* Item 3 */}
                <div className="rounded-xl border border-[#E6E8ED] bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-xs shrink-0">
                      🖨️
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[12.5px] text-[#1B2430] truncate">
                        Configuração de impressora no celular
                      </p>
                      <p className="text-[11px] text-gray-500">
                        REQ-2024-002 · Resolvido em 08 out
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">›</span>
                </div>

                {/* Item 4 */}
                <div className="rounded-xl border border-[#E6E8ED] bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-xs shrink-0">
                      ⌨️
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[12.5px] text-[#1B2430] truncate">
                        Troca de teclado de rede
                      </p>
                      <p className="text-[11px] text-gray-500">
                        INC-2024-004 · Resolvido em 01 out
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">›</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer link */}
          <div className="p-3 border-t border-[#E6E8ED] bg-gray-50 text-center">
            <button className="text-[11.5px] font-medium text-[#0062C4] hover:underline cursor-pointer">
              Ver todos os 4 chamados no Jira ↗
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
