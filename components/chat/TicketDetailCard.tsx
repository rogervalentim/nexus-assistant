"use client";

import type { Ticket } from "@/lib/types";

interface TicketDetailCardProps {
  ticket: Ticket;
  onEscalate: () => void;
  onAddNote?: () => void;
  onBackToList?: () => void;
  disabled?: boolean;
}

export default function TicketDetailCard({
  ticket,
  onEscalate,
  onAddNote,
  onBackToList,
  disabled,
}: TicketDetailCardProps) {
  const isINC001 = ticket.id === "INC-2024-001";

  const priorityLabel =
    ticket.priority === "critical"
      ? "Crítica"
      : ticket.priority === "high"
      ? "Alta"
      : ticket.priority === "medium"
      ? "Média"
      : "Baixa";

  const assigned =
    ticket.assignedTo ||
    (isINC001 ? "Carlos Mendes (Suporte N2)" : "Fila de Atendimento N1");

  return (
    <div className="rounded-2xl border border-[#E6E8ED] bg-white p-5 mt-3 shadow-2xs">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-[#5C6573]">
          Chamado #{ticket.id}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Aberto há 2h · Prazo vencido
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-bold text-[#1B2430] mb-2 tracking-tight">
        {ticket.title}
      </h3>

      {/* Description */}
      {ticket.description && (
        <p className="text-[13px] text-[#5C6573] leading-relaxed mb-4">
          {ticket.description}
        </p>
      )}

      {/* 4-Column Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 mb-4 border-b border-[#F0F2F5]">
        <div>
          <span className="text-[11.5px] text-[#5C6573] block mb-1">Categoria</span>
          <span className="text-[13px] font-medium text-[#1B2430] block">
            {ticket.category === "hardware"
              ? "Hardware / Notebook"
              : ticket.category === "vpn"
              ? "Rede e VPN"
              : ticket.category.toUpperCase()}
          </span>
        </div>

        <div>
          <span className="text-[11.5px] text-[#5C6573] block mb-1">Prioridade</span>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1B2430]">
            <span
              className={`h-2 w-2 rounded-full ${
                ticket.priority === "high" || ticket.priority === "critical"
                  ? "bg-[#F59E0B]"
                  : "bg-blue-500"
              }`}
            />
            <span>{priorityLabel}</span>
          </div>
        </div>

        <div>
          <span className="text-[11.5px] text-[#5C6573] block mb-1">
            Data de abertura
          </span>
          <span className="text-[13px] font-medium text-[#1B2430] block">
            Hoje, 08:30
          </span>
        </div>

        <div>
          <span className="text-[11.5px] text-[#5C6573] block mb-1">
            Quem está cuidando
          </span>
          <span className="text-[13px] font-medium text-[#0062C4] block truncate">
            {assigned}
          </span>
        </div>
      </div>

      {/* Status Notice / SLA Box */}
      <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3 mb-4 text-[12.5px] text-[#3E4757] leading-relaxed">
        ⚠️ <strong>Prazo vencido:</strong> Este chamado está sob responsabilidade de{" "}
        <strong>{assigned}</strong> e o prazo de resposta do SLA foi ultrapassado. Gostaria de priorizar este caso e falar diretamente com um atendente humano?
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onEscalate}
          disabled={disabled}
          className="rounded-xl bg-[#0062C4] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0051a3] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Falar com atendente
        </button>

        {onAddNote && (
          <button
            type="button"
            onClick={onAddNote}
            disabled={disabled}
            className="rounded-xl border border-[#E6E8ED] bg-white px-3.5 py-2 text-[13px] font-medium text-[#1B2430] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Adicionar observação
          </button>
        )}

        {onBackToList && (
          <button
            type="button"
            onClick={onBackToList}
            disabled={disabled}
            className="px-3 py-2 text-[13px] font-medium text-[#5C6573] hover:text-[#1B2430] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Voltar para lista
          </button>
        )}
      </div>
    </div>
  );
}
