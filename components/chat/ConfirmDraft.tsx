"use client";

interface TicketDraft {
  title: string;
  description: string;
  type: string;
  category: string;
  priority: string;
}

interface ConfirmDraftProps {
  draft: TicketDraft;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function ConfirmDraft({
  draft,
  onConfirm,
  onCancel,
  disabled,
}: ConfirmDraftProps) {
  return (
    <div className="rounded-2xl border border-[#E6E8ED] bg-white p-5 mt-3 shadow-2xs">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-[#5C6573]">
          Novo chamado · Rascunho D-581
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#D97706]">
          <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
          Aguardando confirmação
        </span>
      </div>

      {/* Ticket Title */}
      <h3 className="text-[17px] font-bold text-[#1B2430] mb-1.5 tracking-tight">
        {draft.title}
      </h3>

      {/* Ticket Description */}
      {draft.description && (
        <p className="text-[13px] text-[#5C6573] leading-relaxed mb-4">
          {draft.description}
        </p>
      )}

      {/* 3-Column Metadata Grid */}
      <div className="grid grid-cols-3 gap-4 pb-4 mb-4 border-b border-[#F0F2F5]">
        <div>
          <span className="text-[11.5px] text-[#5C6573] block mb-1">Categoria</span>
          <span className="text-[13px] font-medium text-[#1B2430] block">
            {draft.category || "Rede e VPN"}
          </span>
        </div>

        <div>
          <span className="text-[11.5px] text-[#5C6573] block mb-1">Prioridade</span>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1B2430]">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            <span>{draft.priority || "Alta"}</span>
            <span className="text-[#5C6573] font-normal text-[12px]">
              · resposta até 13:40
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11.5px] text-[#5C6573] block mb-1">Afetados</span>
          <span className="text-[13px] font-medium text-[#1B2430] block">
            Somente você
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          className="rounded-xl bg-[#0062C4] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0051a3] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
        >
          Confirmar e abrir <span className="opacity-70 text-[11px]">⌘↵</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="rounded-xl border border-[#E6E8ED] bg-white px-3.5 py-2 text-[13px] font-medium text-[#1B2430] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 cursor-pointer"
        >
          Editar
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="px-3 py-2 text-[13px] font-medium text-[#5C6573] hover:text-[#1B2430] transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
