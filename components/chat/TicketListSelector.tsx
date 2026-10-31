"use client";

import { useState } from "react";
import type { Ticket } from "@/lib/types";

interface TicketListSelectorProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  disabled?: boolean;
}

const STATUS_TAGS: Record<string, { label: string; text: string; bg: string }> = {
  open: {
    label: "Aguardando atendimento",
    text: "text-amber-800",
    bg: "bg-amber-50 border-amber-200",
  },
  in_progress: {
    label: "Em andamento",
    text: "text-[#0062C4]",
    bg: "bg-blue-50 border-blue-200",
  },
  resolved: {
    label: "Aprovado / Resolvido",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  closed: {
    label: "Encerrado",
    text: "text-gray-600",
    bg: "bg-gray-100 border-gray-200",
  },
};

export default function TicketListSelector({
  tickets,
  onSelectTicket,
  disabled,
}: TicketListSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (t: Ticket) => {
    if (disabled) return;
    setSelectedId(t.id);
    onSelectTicket(t);
  };

  return (
    <div className="mt-3 space-y-2.5">
      {tickets.map((t) => {
        const isSelected = selectedId === t.id;
        const tag = STATUS_TAGS[t.status] ?? STATUS_TAGS.open;

        // Relative time label
        const timeLabel =
          t.id === "INC-2024-001"
            ? "há 2h"
            : t.id === "INC-2024-002"
            ? "ontem"
            : "há 3 dias";

        return (
          <div
            key={t.id}
            onClick={() => handleSelect(t)}
            className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-white transition-all cursor-pointer ${
              isSelected
                ? "border-[#0062C4] ring-2 ring-[#0062C4]/15 bg-blue-50/20"
                : "border-[#E6E8ED] hover:border-[#1B2430]/30 hover:bg-[#F8F9FA]"
            } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <input
                type="radio"
                name="ticket-select"
                checked={isSelected}
                onChange={() => handleSelect(t)}
                className="h-4 w-4 text-[#0062C4] border-gray-300 focus:ring-[#0062C4] shrink-0 cursor-pointer"
              />
              <span className="text-[13.5px] font-medium text-[#1B2430] truncate">
                <strong className="font-semibold">{t.id}</strong> - {t.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${tag.bg} ${tag.text}`}
              >
                {t.status === "open" ? "Aguardando atendimento" : tag.label}
              </span>
              <span className="text-[11.5px] text-[#5C6573]">{timeLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
