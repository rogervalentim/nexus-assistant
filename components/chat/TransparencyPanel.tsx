"use client";

import type { AgentStep } from "@/lib/types";

interface TransparencyPanelProps {
  steps: AgentStep[];
  confidence?: number;
  reasoning?: string;
  isStreaming?: boolean;
  onInspect?: () => void;
}

const TOOL_DESCRIPTIONS: Record<string, string> = {
  searchHelpCenter: "buscou na central de ajuda",
  getUserTickets: "consultou seus chamados",
  createTicket: "montou o rascunho",
  updateTicket: "atualizou o chamado",
  escalateToAnalyst: "transferiu para o analista",
  classifyPriority: "classificou a prioridade",
  checkSLA: "consultou o SLA",
};

export default function TransparencyPanel({
  steps,
  isStreaming,
  onInspect,
}: TransparencyPanelProps) {
  if (steps.length === 0 && !isStreaming) return null;

  const visibleSteps = steps.filter((s) => s.tool);

  return (
    <div
      onClick={onInspect}
      className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] cursor-pointer group"
      title="Clique para inspecionar o raciocínio detalhado do agente"
    >
      <span className="font-semibold text-[#1B2430]">
        Nexo Assist
      </span>

      {isStreaming && visibleSteps.length === 0 ? (
        <span className="flex items-center gap-1.5 text-[#0062C4] font-medium text-[12px]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0062C4] animate-ping" />
          analisando solicitação...
        </span>
      ) : (
        visibleSteps.map((step, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1 text-[#5C6573] group-hover:text-[#1B2430] transition-colors"
          >
            <span className="text-[#5C6573] font-medium">✓</span>
            <span>{TOOL_DESCRIPTIONS[step.tool] || step.tool}</span>
          </span>
        ))
      )}
    </div>
  );
}
