/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import TransparencyPanel from "./TransparencyPanel";
import TicketCard from "./TicketCard";
import ConfirmDraft from "./ConfirmDraft";
import TicketListSelector from "./TicketListSelector";
import TicketDetailCard from "./TicketDetailCard";
import type { AgentStep, Ticket, Message } from "@/lib/types";
import Image from "next/image";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isAnalyst: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: AgentStep[];
  confidence?: number;
  reasoning?: string;
  isStreaming?: boolean;
  tickets?: Ticket[];
}

const MSG_LIMIT = 30;

const AFFECTED_OPTIONS = [
  { label: "Só eu", value: "Só eu" },
  { label: "Minha equipe", value: "Minha equipe" },
  { label: "Toda a empresa", value: "Toda a empresa" },
  { label: "Não sei", value: "Não sei ao certo" },
];

function extractTicketsFromSteps(steps: AgentStep[]): Ticket[] {
  const tickets: Ticket[] = [];
  for (const step of steps) {
    if (
      (step.tool === "getUserTickets" || step.tool === "createTicket") &&
      step.success &&
      step.output
    ) {
      const out = step.output as Record<string, unknown>;
      if (Array.isArray(out.tickets)) {
        tickets.push(...(out.tickets as Ticket[]));
      }
      if (out.ticket) {
        tickets.push(out.ticket as Ticket);
      }
    }
  }
  return tickets;
}

function parseTicketDraft(content: string) {
  if (!content.includes("Rascunho do Chamado")) return null;
  const titleMatch =
    content.match(/- \*\*Título:\*\* (.*)/i) ||
    content.match(/- Título: (.*)/i);
  const descMatch =
    content.match(/- \*\*Descrição:\*\* (.*)/i) ||
    content.match(/- Descrição: (.*)/i);
  const typeMatch =
    content.match(/- \*\*Tipo:\*\* (.*)/i) || content.match(/- Tipo: (.*)/i);
  const catMatch =
    content.match(/- \*\*Categoria:\*\* (.*)/i) ||
    content.match(/- Categoria: (.*)/i);
  const prioMatch =
    content.match(/- \*\*Prioridade:\*\* (.*)/i) ||
    content.match(/- Prioridade: (.*)/i);

  if (titleMatch) {
    return {
      title: titleMatch[1].trim(),
      description: descMatch ? descMatch[1].trim() : "",
      type: typeMatch ? typeMatch[1].trim() : "Incidente",
      category: catMatch ? catMatch[1].trim() : "Outro",
      priority: prioMatch ? prioMatch[1].trim() : "Média",
    };
  }
  return null;
}

export default function ChatPageClient() {
  const router = useRouter();
  const [user, setUser] = useState<Employee | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [showTransparency, setShowTransparency] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState<{
    steps: AgentStep[];
    confidence?: number;
    reasoning?: string;
  } | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>("active");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load user from sessionStorage and initialize or restore session
  useEffect(() => {
    const stored = sessionStorage.getItem("nexo_user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const emp = JSON.parse(stored) as Employee;
    if (emp.isAnalyst) {
      router.replace("/analyst");
      return;
    }
    setUser(emp);

    async function initSession() {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: emp.email }),
        });
        const data = (await res.json()) as { session?: any };
        if (data.session) {
          setSessionId(data.session.id);
          setMessageCount(data.session.messageCount ?? 0);
          setSessionStatus(data.session.status ?? "active");

          if (data.session.messages && data.session.messages.length > 0) {
            const restored: ChatMessage[] = data.session.messages.map(
              (m: Message) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                steps: m.thinking?.steps ?? [],
                confidence: m.thinking?.confidence,
                reasoning: m.thinking?.reasoning,
                tickets: m.thinking?.steps
                  ? extractTicketsFromSteps(m.thinking.steps)
                  : [],
              }),
            );
            setMessages(restored);
            return;
          }
        }
      } catch {
        // ignore and fallback to welcome
      }

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Olá, **${emp.name}**! 👋 Sou o **Nexo Assist**, seu assistente inteligente do Service Desk de TI da Nexo.\n\nComo posso ajudar você hoje?\n\n- 🔍 Tirar dúvidas técnicas na base de conhecimento\n- 📋 Consultar o andamento dos seus chamados\n- 🆕 Abrir novos chamados de suporte com confirmação\n- 👤 Chamar um analista humano quando necessário`,
          steps: [],
        },
      ]);
    }

    initSession();
  }, [router]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Poll for analyst messages if session is with or waiting analyst
  useEffect(() => {
    if (
      !sessionId ||
      (sessionStatus !== "waiting_analyst" && sessionStatus !== "with_analyst")
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = (await res.json()) as { session?: any };
        if (data.session) {
          setSessionStatus(data.session.status);
          setMessageCount(data.session.messageCount ?? 0);

          if (
            data.session.messages &&
            data.session.messages.length > messages.length
          ) {
            const restored: ChatMessage[] = data.session.messages.map(
              (m: Message) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                steps: m.thinking?.steps ?? [],
                confidence: m.thinking?.confidence,
                reasoning: m.thinking?.reasoning,
                tickets: m.thinking?.steps
                  ? extractTicketsFromSteps(m.thinking.steps)
                  : [],
              }),
            );
            setMessages(restored);
          }
        }
      } catch {
        // ignore
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [sessionId, sessionStatus, messages.length]);

  const sendDirectMessage = useCallback(
    async (textToSend: string) => {
      if (
        !textToSend.trim() ||
        isStreaming ||
        !user ||
        messageCount >= MSG_LIMIT
      )
        return;

      const userText = textToSend.trim();
      setInput("");

      const userMsgId = `user-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: userText },
      ]);

      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          steps: [],
          isStreaming: true,
        },
      ]);

      setIsStreaming(true);
      let accText = "";
      const accSteps: AgentStep[] = [];
      let finalConfidence: number | undefined;
      let finalReasoning: string | undefined;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            userEmail: user.email,
            message: userText,
          }),
        });

        if (!res.ok || !res.body) throw new Error("Network error");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const chunk = JSON.parse(line.slice(6)) as {
                type: string;
                payload: any;
              };

              if (chunk.type === "session") {
                setSessionId(chunk.payload.sessionId);
                setMessageCount(chunk.payload.messageCount);
              } else if (chunk.type === "text") {
                accText += chunk.payload as string;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accText } : m,
                  ),
                );
              } else if (chunk.type === "step") {
                const step = chunk.payload as AgentStep;
                if (step.tool) {
                  const exists = accSteps.findIndex(
                    (s) => s.tool === step.tool && !s.durationMs,
                  );
                  if (exists >= 0) accSteps[exists] = step;
                  else accSteps.push(step);

                  if (step.tool === "escalateToAnalyst" && step.success) {
                    setSessionStatus("waiting_analyst");
                  }

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, steps: [...accSteps] }
                        : m,
                    ),
                  );
                }
              } else if (chunk.type === "done") {
                setMessageCount(chunk.payload.messageCount ?? messageCount + 2);
                finalConfidence = chunk.payload.confidence;
                finalReasoning = chunk.payload.reasoning;
                const tickets = extractTicketsFromSteps(accSteps);

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          steps: accSteps,
                          confidence: finalConfidence,
                          reasoning: finalReasoning,
                          isStreaming: false,
                          tickets,
                        }
                      : m,
                  ),
                );
              } else if (chunk.type === "error") {
                const errMsg = chunk.payload as string;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: `⚠️ ${errMsg}`,
                          isStreaming: false,
                          steps: accSteps,
                        }
                      : m,
                  ),
                );
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    "❌ Ocorreu um erro ao processar sua mensagem. Tente novamente.",
                  isStreaming: false,
                }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, user, sessionId, messageCount],
  );

  const sendMessage = useCallback(() => {
    sendDirectMessage(input);
  }, [input, sendDirectMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("nexo_user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const remaining = MSG_LIMIT - messageCount;
  const isEscalated =
    sessionStatus === "waiting_analyst" || sessionStatus === "with_analyst";

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="p-6 border-r border-[#E6E8ED] w-64 flex flex-col justify-between h-screen shrink-0 bg-white">
        <div>
          <Image
            src="/logo-2.png"
            alt="Logo"
            width={136}
            height={20}
            className="mb-6"
          />
          <ul className="space-y-1">
            <li>
              <a
                href="/chat"
                className="flex items-center gap-3 bg-[#0285F7]/10 h-10 px-3 rounded-lg text-[#006AC7] font-semibold text-[14px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Atendimento
              </a>
            </li>
            <li>
              <a
                href="/profile"
                className="flex items-center gap-3 h-10 px-3 rounded-lg text-[#3E4757] font-medium text-[14px] hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-3 pt-4 border-t border-[#E6E8ED] mb-3">
            <div className="h-9 w-9 rounded-full bg-[#0285F7]/10 flex items-center justify-center text-[#006AC7] text-[13px] font-bold shrink-0">
              {(() => {
                if (!user?.name) return "";
                const names = user.name.trim().split(/\s+/);
                if (names.length === 1) return names[0].charAt(0).toUpperCase();
                return (
                  names[0].charAt(0) + names[names.length - 1].charAt(0)
                ).toUpperCase();
              })()}
            </div>
            <div className="hidden sm:block text-left overflow-hidden">
              <p className="text-[14px] font-semibold text-[#1B2430] truncate">
                {user?.name}
              </p>
              <p className="text-[12px] text-[#5C6573] truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-[13.5px] font-medium text-[#3E4757] hover:text-red-600 cursor-pointer flex gap-2.5 items-center shrink-0 w-full transition-colors"
          >
            <Image
              src="/logout.png"
              width={16}
              height={16}
              alt="logout image"
            />
            Sair
          </button>
        </div>
      </aside>

      {/* Area Principal */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Header topo */}
        <header className="border-b border-[#E6E8ED] px-8 py-4.5 bg-white flex items-center justify-between shrink-0">
          <ul className="flex items-center gap-2">
            <li className="text-[#5C6573] text-[13.5px] font-normal">
              Service desk de TI
            </li>
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="#5C6573"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </li>
            <li className="text-[#1B2430] text-[13.5px] font-semibold">
              Atendimento
            </li>
          </ul>

          <div className="flex items-center gap-3">
            {sessionStatus === "waiting_analyst" ? (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Na fila do analista
              </span>
            ) : sessionStatus === "with_analyst" ? (
              <span className="rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-1 text-xs font-medium text-indigo-700 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                Em atendimento humano
              </span>
            ) : (
              <span className="rounded-full bg-[#00BD6B]/8 px-3 py-1 text-[12.5px] font-medium text-[#00804A] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#00BD6B]" />
                Assistente online
              </span>
            )}
          </div>
        </header>

        {/* Chat + Painel de Transparência */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Mensagens com container centralizado de margem larga como no print */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((msg, idx) => {
                  const isLastAssistant =
                    msg.role === "assistant" && idx === messages.length - 1;
                  const draft = isLastAssistant
                    ? parseTicketDraft(msg.content)
                    : null;

                  // Detect "who is affected" question to show chips inside the card
                  const showAffectedChips =
                    msg.role === "assistant" &&
                    isLastAssistant &&
                    !msg.isStreaming &&
                    (msg.content.includes("sendo afetado") ||
                      msg.content.includes("quem está sendo afetado") ||
                      msg.content.toLowerCase().includes("quem está sendo"));

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] ${msg.role === "user" ? "order-2" : "order-1"}`}
                      >
                        {msg.role === "assistant" &&
                          showTransparency &&
                          msg.steps &&
                          msg.steps.length > 0 && (
                            <TransparencyPanel
                              steps={msg.steps}
                              confidence={msg.confidence}
                              reasoning={msg.reasoning}
                              isStreaming={msg.isStreaming}
                              onInspect={() =>
                                setSelectedInspection({
                                  steps: msg.steps ?? [],
                                  confidence: msg.confidence,
                                  reasoning: msg.reasoning,
                                })
                              }
                            />
                          )}

                        <div
                          className={`rounded-2xl px-4.5 py-3.5 ${
                            msg.role === "user"
                              ? "bg-[#1B2430] text-white font-normal text-[14.5px] rounded-br-xs"
                              : "bg-white border border-[#E6E8ED] text-gray-800 shadow-2xs rounded-bl-xs"
                          }`}
                        >
                          {msg.isStreaming && !msg.content ? (
                            <div className="flex gap-1 py-1">
                              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                            </div>
                          ) : msg.role === "user" ? (
                            <p className="text-white text-[14.5px] leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          ) : (
                            <div
                              className="prose prose-sm max-w-none leading-relaxed text-[14.5px]"
                              dangerouslySetInnerHTML={{
                                __html: formatMarkdown(msg.content),
                              }}
                            />
                          )}
                          {msg.isStreaming && msg.content && (
                            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-current opacity-70" />
                          )}

                          {/* Affected chips — shown inline inside assistant card */}
                          {showAffectedChips && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {AFFECTED_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => sendDirectMessage(opt.value)}
                                  disabled={isStreaming}
                                  className="rounded-full border border-[#0285F7] px-4 py-1.5 text-[13px] font-medium text-[#0062C4] hover:bg-[#0285F7]/10 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {draft && !msg.isStreaming && (
                          <ConfirmDraft
                            draft={draft}
                            disabled={isStreaming}
                            onConfirm={() =>
                              sendDirectMessage(
                                "Sim, confirmo a abertura do chamado com esses dados.",
                              )
                            }
                            onCancel={() =>
                              sendDirectMessage(
                                "Não desejo abrir o chamado agora. Gostaria de verificar outras opções.",
                              )
                            }
                          />
                        )}

                        {/* Screen 2: Interactive Ticket Selection list */}
                        {msg.role === "assistant" &&
                          !msg.isStreaming &&
                          (msg.content.includes("Sobre qual deles") ||
                            msg.content.includes("qual deles deseja falar")) &&
                          msg.tickets &&
                          msg.tickets.length > 0 && (
                            <TicketListSelector
                              tickets={msg.tickets}
                              disabled={isStreaming}
                              onSelectTicket={(selectedT) =>
                                sendDirectMessage(
                                  `${selectedT.id} - Meu caso é urgente, preciso de retorno`,
                                )
                              }
                            />
                          )}

                        {/* Screen 2: Detailed Ticket Card with Transfer action */}
                        {msg.role === "assistant" &&
                          !msg.isStreaming &&
                          (msg.content.includes("INC-2024-001") ||
                            msg.content.includes(
                              "Consultei os detalhes do chamado",
                            ) ||
                            msg.content.includes("Consultei o chamado")) && (
                            <TicketDetailCard
                              ticket={
                                msg.tickets?.find(
                                  (t) => t.id === "INC-2024-001",
                                ) || {
                                  id: "INC-2024-001",
                                  title:
                                    "Notebook não liga após queda de energia",
                                  description:
                                    "Após a queda de energia no escritório na manhã de hoje, o notebook Dell não dá sinal de vida. Já tentei trocar de tomada e segurar o botão de ligar por 30 segundos, sem sucesso.",
                                  status: "open",
                                  priority: "high",
                                  type: "incident",
                                  category: "hardware",
                                  userEmail:
                                    user?.email || "ana.silva@nexo.com.br",
                                  assignedTo: "Carlos Mendes (Suporte N2)",
                                  createdAt: new Date(
                                    Date.now() - 2 * 60 * 60 * 1000,
                                  ).toISOString(),
                                  updatedAt: new Date(
                                    Date.now() - 1 * 60 * 60 * 1000,
                                  ).toISOString(),
                                }
                              }
                              disabled={isStreaming}
                              onEscalate={() =>
                                sendDirectMessage("Falar com atendente")
                              }
                              onAddNote={() =>
                                sendDirectMessage(
                                  "Gostaria de adicionar uma observação ao chamado INC-2024-001.",
                                )
                              }
                              onBackToList={() =>
                                sendDirectMessage(
                                  "Qual o status do meu chamado?",
                                )
                              }
                            />
                          )}

                        {/* Transfer to analyst notification pill */}
                        {msg.role === "assistant" &&
                          (msg.content.includes(
                            "transferindo seu atendimento",
                          ) ||
                            msg.content.includes(
                              "Aguardando analista disponível",
                            )) && (
                            <div className="my-4 flex items-center justify-center gap-2">
                              <div className="h-px flex-1 bg-[#E6E8ED]" />
                              <span className="rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-semibold text-amber-800 flex items-center gap-1.5 shadow-2xs">
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                Atendimento transferido para a fila humana ·
                                Analista N1/N2
                              </span>
                              <div className="h-px flex-1 bg-[#E6E8ED]" />
                            </div>
                          )}

                        {/* Default Ticket Cards if not list or detail */}
                        {msg.role === "assistant" &&
                          !msg.content.includes("Sobre qual deles") &&
                          !msg.content.includes("INC-2024-001") &&
                          !msg.content.includes("Consultei os detalhes") &&
                          msg.tickets &&
                          msg.tickets.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {msg.tickets.map((ticket) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Message limit banner */}
            {messageCount >= MSG_LIMIT && (
              <div className="max-w-4xl mx-auto w-full px-6 mb-2">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center text-sm text-amber-800">
                  ⚠️ Limite de {MSG_LIMIT} mensagens atingido para esta sessão.
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="bg-white border-t border-[#E6E8ED] px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 rounded-2xl border border-[#E6E8ED] bg-[#F8F9FA] px-4 py-2.5 focus-within:border-[#0285F7] focus-within:ring-2 focus-within:ring-[#0285F7]/10 transition-all">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      messageCount >= MSG_LIMIT
                        ? "Limite de mensagens atingido"
                        : isEscalated
                          ? "Mensagem direta para o analista humano..."
                          : "Escreva para o Nexo..."
                    }
                    disabled={isStreaming || messageCount >= MSG_LIMIT}
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-[14px] text-[#1B2430] placeholder:text-[#9AA3AF] outline-none disabled:cursor-not-allowed disabled:opacity-60 max-h-32"
                    style={{ minHeight: "28px", height: "auto" }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={
                      !input.trim() || isStreaming || messageCount >= MSG_LIMIT
                    }
                    className="flex h-9 px-4 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0285F7] text-white font-medium text-[13.5px] transition-all hover:bg-[#006AC7] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {isStreaming ? (
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
                    ) : (
                      <>
                        <span>Enviar</span>
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M12 5l7 7-7 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-end text-[11.5px] text-[#9AA3AF] px-1">
                  <span>
                    {messageCount}/{MSG_LIMIT} mensagens nesta sessão
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer de inspeção de transparência */}
          {selectedInspection && showTransparency && (
            <div className="w-88 shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4 shadow-lg flex flex-col">
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="font-semibold text-gray-900 text-base">
                    🔬 Transparência de Decisão
                  </h2>
                  <p className="text-xs text-gray-500">
                    Inspeção em tempo real das ações do agente
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInspection(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-emerald-900">
                    Grau de Confiança do Agente:
                  </span>
                  <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-900">
                    {Math.round((selectedInspection.confidence ?? 0.95) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${Math.round((selectedInspection.confidence ?? 0.95) * 100)}%`,
                    }}
                  />
                </div>
                {selectedInspection.reasoning && (
                  <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                    💡 <strong>Raciocínio:</strong>{" "}
                    {selectedInspection.reasoning}
                  </p>
                )}
              </div>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Ferramentas Acionadas ({selectedInspection.steps.length})
              </h3>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {selectedInspection.steps.map((step, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${step.success ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                      >
                        {step.success ? "✓" : "✗"} {step.tool}
                      </span>
                      <span className="font-mono text-gray-400">
                        {step.durationMs}ms
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                      {step.description}
                    </p>
                    {step.errorMessage && (
                      <div className="mt-1 rounded-md bg-red-50 border border-red-200 p-2 text-red-700">
                        ⚠️ {step.errorMessage}
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-200/60">
                      <details>
                        <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                          Ver Parâmetros e Retorno
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <p className="font-semibold text-gray-500">
                              Entrada (Payload):
                            </p>
                            <pre className="mt-0.5 overflow-x-auto rounded bg-gray-100 p-2 font-mono text-[11px] text-gray-800">
                              {JSON.stringify(step.input, null, 2)}
                            </pre>
                          </div>
                          {Boolean(step.output) && (
                            <div>
                              <p className="font-semibold text-gray-500">
                                Saída (Resposta):
                              </p>
                              <pre className="mt-0.5 overflow-x-auto rounded bg-gray-100 p-2 font-mono text-[11px] text-gray-800">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 px-1 rounded text-sm font-mono text-blue-600">$1</code>',
    )
    .replace(/^### (.*$)/gm, '<h3 class="font-semibold text-base mt-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="font-semibold text-lg mt-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="font-bold text-xl mt-2">$1</h1>')
    .replace(/^---+$/gm, '<hr class="border-gray-200 my-2" />')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, "<br />");
}
