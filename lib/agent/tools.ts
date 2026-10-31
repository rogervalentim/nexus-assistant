/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// Nexo Assist — Agent Tools (Typed, Zod-validated)
// ============================================================
import { z } from "zod";
import { tool, zodSchema } from "ai";
import {
  searchHelpCenter,
  getUserTickets,
  createNewTicket,
  updateUserTicket,
  ServiceUnavailableError,
} from "../ticket-service";
import { updateSession } from "../data/store";
import type { AgentStep, TicketPriority, TicketType, TicketCategory } from "../types";

// ─── Helper: create a tracked step ──────────────────────────

interface ToolCallContext {
  sessionId?: string;
  userEmail: string;
  onStep?: (step: AgentStep) => void;
}

function makeStep(
  toolName: string,
  description: string,
  input: unknown,
  output: unknown,
  start: number,
  error?: string
): AgentStep {
  return {
    tool: toolName,
    description,
    input,
    output: error ? null : output,
    durationMs: Date.now() - start,
    success: !error,
    errorMessage: error,
  };
}

// ─── Tool Definitions ────────────────────────────────────────

/**
 * searchHelpCenter — Searches the IT knowledge base
 */
export function buildSearchHelpCenterTool(ctx: ToolCallContext) {
  return (tool as any)({
    description:
      "Pesquisa artigos na base de conhecimento de TI da Nexo. Use para responder dúvidas técnicas antes de criar chamados.",
    parameters: zodSchema(
      z.object({
        query: z
          .string()
          .describe(
            "Termos de busca em português para encontrar artigos relevantes. Ex: 'VPN não conecta', 'outlook email'."
          ),
      })
    ),
    execute: async ({ query }: { query: string }) => {
      const start = Date.now();
      try {
        const results = await searchHelpCenter(query);
        const step = makeStep(
          "searchHelpCenter",
          `Consultou a base de conhecimento para: "${query}"`,
          { query },
          { count: results.length, articles: results.map((a) => a.title) },
          start
        );
        ctx.onStep?.(step);

        if (results.length === 0) {
          return {
            success: true,
            found: false,
            message: "Nenhum artigo encontrado para esta consulta.",
            articles: [],
          };
        }

        return {
          success: true,
          found: true,
          articles: results.map((a) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            category: a.category,
            tags: a.tags,
          })),
        };
      } catch (err) {
        const msg =
          err instanceof ServiceUnavailableError
            ? err.message
            : "Erro ao consultar a base de conhecimento.";
        const step = makeStep(
          "searchHelpCenter",
          "Falha ao consultar base de conhecimento",
          { query },
          null,
          start,
          msg
        );
        ctx.onStep?.(step);
        return { success: false, error: msg };
      }
    },
  });
}

/**
 * getUserTickets — Lists tickets for the authenticated user
 */
export function buildGetUserTicketsTool(ctx: ToolCallContext) {
  return (tool as any)({
    description:
      "Lista todos os chamados de suporte do usuário autenticado. Sempre use esta ferramenta antes de criar um chamado novo para evitar duplicatas.",
    parameters: zodSchema(
      z.object({
        includeResolved: z
          .boolean()
          .optional()
          .describe("Se true, inclui chamados resolvidos/fechados. Padrão: false."),
      })
    ),
    execute: async ({ includeResolved = false }: { includeResolved?: boolean }) => {
      const start = Date.now();
      try {
        const tickets = await getUserTickets(ctx.userEmail);
        const filtered = includeResolved
          ? tickets
          : tickets.filter((t) => !["resolved", "closed"].includes(t.status));

        const step = makeStep(
          "getUserTickets",
          `Consultou ${filtered.length} chamado(s) de ${ctx.userEmail}`,
          { userEmail: ctx.userEmail, includeResolved },
          { count: filtered.length },
          start
        );
        ctx.onStep?.(step);

        return {
          success: true,
          count: filtered.length,
          tickets: filtered.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            type: t.type,
            category: t.category,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            description: t.description,
            assignedTo: t.assignedTo,
          })),
        };
      } catch (err) {
        const msg =
          err instanceof ServiceUnavailableError
            ? err.message
            : "Erro ao consultar chamados.";
        const step = makeStep(
          "getUserTickets",
          "Falha ao consultar chamados",
          { userEmail: ctx.userEmail },
          null,
          start,
          msg
        );
        ctx.onStep?.(step);
        return { success: false, error: msg };
      }
    },
  });
}

/**
 * createTicket — Creates a new support ticket (after user confirmation)
 */
export function buildCreateTicketTool(ctx: ToolCallContext) {
  return (tool as any)({
    description:
      "Cria um novo chamado de suporte. IMPORTANTE: Antes de usar esta ferramenta, verifique chamados existentes e obtenha confirmação explícita do usuário.",
    parameters: zodSchema(
      z.object({
        title: z.string().describe("Título conciso do chamado (máx 100 chars)."),
        description: z
          .string()
          .describe("Descrição detalhada do problema ou solicitação."),
        priority: z
          .enum(["low", "medium", "high", "critical"])
          .describe("Prioridade: low=baixa, medium=média, high=alta, critical=crítica."),
        type: z
          .enum(["incident", "request", "problem", "change"])
          .describe("Tipo: incident=incidente, request=solicitação, problem=problema, change=mudança."),
        category: z
          .enum(["hardware", "software", "network", "access", "email", "vpn", "printer", "other"])
          .describe("Categoria do problema."),
        userConfirmed: z
          .boolean()
          .describe("OBRIGATÓRIO: true apenas se o usuário confirmou explicitamente a abertura do chamado."),
      })
    ),
    execute: async ({
      title,
      description,
      priority,
      type,
      category,
      userConfirmed,
    }: {
      title: string;
      description: string;
      priority: TicketPriority;
      type: TicketType;
      category: TicketCategory;
      userConfirmed: boolean;
    }) => {
      const start = Date.now();

      if (!userConfirmed) {
        const step = makeStep(
          "createTicket",
          "Criação de chamado aguardando confirmação do usuário",
          { title, priority, type, category },
          { pendingConfirmation: true },
          start
        );
        ctx.onStep?.(step);
        return {
          success: false,
          pendingConfirmation: true,
          message: "Aguardando confirmação do usuário para criar o chamado.",
        };
      }

      try {
        const { ticket, isDuplicate } = await createNewTicket(
          { title, description, priority, type, category, userEmail: ctx.userEmail },
          ctx.userEmail
        );

        const step = makeStep(
          "createTicket",
          isDuplicate
            ? `Chamado duplicado detectado: ${ticket.id}`
            : `Chamado criado com sucesso: ${ticket.id}`,
          { title, priority, type, category },
          { ticketId: ticket.id, isDuplicate },
          start
        );
        ctx.onStep?.(step);

        return {
          success: true,
          isDuplicate,
          ticket: {
            id: ticket.id,
            title: ticket.title,
            status: ticket.status,
            priority: ticket.priority,
            type: ticket.type,
            category: ticket.category,
            createdAt: ticket.createdAt,
          },
          message: isDuplicate
            ? `Chamado duplicado encontrado: ${ticket.id}. O chamado existente foi retornado.`
            : `Chamado ${ticket.id} criado com sucesso!`,
        };
      } catch (err) {
        const msg =
          err instanceof ServiceUnavailableError
            ? err.message
            : "Erro ao criar chamado.";
        const step = makeStep(
          "createTicket",
          "Falha ao criar chamado",
          { title },
          null,
          start,
          msg
        );
        ctx.onStep?.(step);
        return { success: false, error: msg };
      }
    },
  });
}

/**
 * updateTicket — Updates an existing ticket
 */
export function buildUpdateTicketTool(ctx: ToolCallContext) {
  return (tool as any)({
    description:
      "Atualiza informações de um chamado existente do usuário. Só pode atualizar chamados do próprio usuário autenticado.",
    parameters: zodSchema(
      z.object({
        ticketId: z.string().describe("ID do chamado a ser atualizado (ex: TKT-0001)."),
        updates: z
          .object({
            status: z
              .enum(["open", "in_progress", "waiting_user", "resolved", "closed"])
              .optional(),
            description: z
              .string()
              .optional()
              .describe("Informações adicionais sobre o problema."),
            priority: z.enum(["low", "medium", "high", "critical"]).optional(),
          })
          .describe("Campos a serem atualizados."),
        userConfirmed: z
          .boolean()
          .describe("true se o usuário confirmou a atualização."),
      })
    ),
    execute: async ({
      ticketId,
      updates,
      userConfirmed,
    }: {
      ticketId: string;
      updates: {
        status?: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
        description?: string;
        priority?: TicketPriority;
      };
      userConfirmed: boolean;
    }) => {
      const start = Date.now();

      if (!userConfirmed) {
        const step = makeStep(
          "updateTicket",
          `Atualização do chamado ${ticketId} aguardando confirmação`,
          { ticketId, updates },
          { pendingConfirmation: true },
          start
        );
        ctx.onStep?.(step);
        return { success: false, pendingConfirmation: true };
      }

      try {
        const updated = await updateUserTicket(ticketId, updates, ctx.userEmail);
        const step = makeStep(
          "updateTicket",
          `Chamado ${ticketId} atualizado com sucesso`,
          { ticketId, updates },
          { ticketId: updated.id, status: updated.status },
          start
        );
        ctx.onStep?.(step);

        return {
          success: true,
          ticket: {
            id: updated.id,
            title: updated.title,
            status: updated.status,
            priority: updated.priority,
            updatedAt: updated.updatedAt,
          },
        };
      } catch (err) {
        const msg =
          err instanceof ServiceUnavailableError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Erro ao atualizar chamado.";
        const step = makeStep(
          "updateTicket",
          `Falha ao atualizar chamado ${ticketId}`,
          { ticketId },
          null,
          start,
          msg
        );
        ctx.onStep?.(step);
        return { success: false, error: msg };
      }
    },
  });
}

/**
 * escalateToAnalyst — Escalates the conversation to a human analyst
 */
export function buildEscalateToAnalystTool(ctx: ToolCallContext) {
  return (tool as any)({
    description:
      "Escala o atendimento para um analista humano. Use quando o usuário solicitar, quando o problema é complexo/crítico, ou quando você não conseguiu resolver após múltiplas tentativas.",
    parameters: zodSchema(
      z.object({
        reason: z
          .string()
          .describe("Motivo do escalonamento em português. Será visível para o analista."),
        urgency: z
          .enum(["low", "normal", "high", "critical"])
          .describe("Urgência do escalonamento."),
        summary: z
          .string()
          .describe("Resumo do que foi discutido e tentado até agora, para contexto do analista."),
      })
    ),
    execute: async ({
      reason,
      urgency,
      summary,
    }: {
      reason: string;
      urgency: "low" | "normal" | "high" | "critical";
      summary: string;
    }) => {
      const start = Date.now();
      try {
        if (ctx.sessionId) {
          updateSession(ctx.sessionId, {
            status: "waiting_analyst",
            escalationReason: `[${urgency.toUpperCase()}] ${reason}\n\nResumo: ${summary}`,
          });
        }

        const step = makeStep(
          "escalateToAnalyst",
          `Escalonamento para analista: ${reason}`,
          { reason, urgency },
          { escalated: true, sessionId: ctx.sessionId },
          start
        );
        ctx.onStep?.(step);

        return {
          success: true,
          escalated: true,
          message: "Atendimento escalonado para um analista humano.",
          estimatedWait:
            urgency === "critical"
              ? "Imediato (plantão 24/7)"
              : "Até 4 horas (horário comercial)",
        };
      } catch (err) {
        const step = makeStep(
          "escalateToAnalyst",
          "Falha ao escalonar",
          { reason },
          null,
          start,
          String(err)
        );
        ctx.onStep?.(step);
        return { success: false, error: "Erro ao escalonar. Tente novamente." };
      }
    },
  });
}

// ─── Build all tools for a session ──────────────────────────

export function buildAgentTools(ctx: ToolCallContext) {
  return {
    searchHelpCenter: buildSearchHelpCenterTool(ctx),
    getUserTickets: buildGetUserTicketsTool(ctx),
    createTicket: buildCreateTicketTool(ctx),
    updateTicket: buildUpdateTicketTool(ctx),
    escalateToAnalyst: buildEscalateToAnalystTool(ctx),
  };
}
