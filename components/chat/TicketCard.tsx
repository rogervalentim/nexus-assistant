"use client";

import type { Ticket } from "@/lib/types";

interface TicketCardProps {
  ticket: Ticket;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  open: {
    label: "Aberto",
    bg: "bg-blue-50",
    text: "text-[#0062C4]",
    dot: "bg-[#0062C4]",
  },
  in_progress: {
    label: "Em andamento",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-[#F5A300]",
  },
  waiting_user: {
    label: "Aguardando você",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  resolved: {
    label: "Resolvido",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-[#00BD6B]",
  },
  closed: {
    label: "Encerrado",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
};

const PRIORITY_DOTS: Record<string, string> = {
  low: "bg-gray-400",
  medium: "bg-[#F5A300]",
  high: "bg-[#F5A300]",
  critical: "bg-red-500",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const TYPE_LABELS: Record<string, string> = {
  incident: "Incidente",
  request: "Solicitação",
  problem: "Problema",
  change: "Mudança",
};

export default function TicketCard({ ticket }: TicketCardProps) {
  const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
  const priorityDot = PRIORITY_DOTS[ticket.priority] ?? "bg-[#F5A300]";
  const priorityLabel = PRIORITY_LABELS[ticket.priority] ?? ticket.priority;
  const typeLabel = TYPE_LABELS[ticket.type] ?? ticket.type;

  return (
    <div className="rounded-xl border border-[#E6E8ED] bg-white p-3.5 shadow-xs transition-all hover:border-[#1B2431]/20">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full shrink-0 ${priorityDot}`} />
          <span className="font-mono text-[13px] font-semibold text-[#1B2430]">
            {ticket.id}
          </span>
          <span className="text-[12px] text-[#5C6573]">·</span>
          <span className="text-[12px] font-medium text-[#5C6573]">
            {ticket.category || typeLabel}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </div>

      <p className="font-medium text-[#1B2430] text-[13.5px] leading-snug mb-1">
        {ticket.title}
      </p>

      {ticket.description && (
        <p className="text-[12.5px] text-[#5C6573] line-clamp-2 leading-relaxed mb-2.5">
          {ticket.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#F0F2F5] text-[11.5px] text-[#5C6573]">
        <span className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${priorityDot}`} />
          Prioridade {priorityLabel}
        </span>
        <span>·</span>
        <span>Tipo: {typeLabel}</span>
        <span>·</span>
        <span>
          Aberto em {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
        </span>
      </div>

      {ticket.resolution && (
        <div className="mt-2.5 rounded-lg bg-[#00BD6B]/8 border border-[#00BD6B]/20 px-3 py-2 text-[12px] text-[#00804A]">
          <strong>Resolução:</strong> {ticket.resolution}
        </div>
      )}
    </div>
  );
}
