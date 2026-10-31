// ============================================================
// Nexo Assist — Simulated Ticket Service (with fault injection)
// ============================================================
import type {
  Ticket,
  CreateTicketPayload,
  UpdateTicketPayload,
  KBArticle,
} from "./types";
import {
  getTicketsByEmail,
  getTicketById,
  createTicket,
  updateTicket,
  generateTicketId,
} from "./data/store";
import { KNOWLEDGE_BASE } from "./data/seed";

// ─── Fault Injection ────────────────────────────────────────
// Enabled when SIMULATE_FAULTS=true in .env
const FAULT_RATE = process.env.SIMULATE_FAULTS === "true" ? 0.10 : 0;

async function simulateNetworkCall<T>(fn: () => T): Promise<T> {
  // Simulate variable latency (100–600ms)
  const latency = 100 + Math.random() * 500;
  await new Promise((r) => setTimeout(r, latency));

  // Inject occasional faults
  if (Math.random() < FAULT_RATE) {
    const faultType = Math.random();
    if (faultType < 0.5) {
      throw new ServiceUnavailableError(
        "O serviço de chamados está temporariamente indisponível. Tente novamente em instantes."
      );
    } else {
      // Extra latency (timeout-like)
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return fn();
}

export class ServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}

// ─── Service Functions ──────────────────────────────────────

/**
 * Search the knowledge base by query string.
 * Simple keyword-based matching (no embeddings needed for this demo).
 */
export async function searchHelpCenter(query: string): Promise<KBArticle[]> {
  return simulateNetworkCall(() => {
    const q = query.toLowerCase();
    const tokens = q.split(/\s+/).filter((t) => t.length > 2);

    const scored = KNOWLEDGE_BASE.map((article) => {
      const haystack = [
        article.title,
        article.content,
        ...article.tags,
        article.category,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const token of tokens) {
        const count = (haystack.match(new RegExp(token, "g")) ?? []).length;
        score += count;
      }

      return { article, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.article);
  });
}

/**
 * Get all tickets belonging to a specific user (strict isolation).
 */
export async function getUserTickets(userEmail: string): Promise<Ticket[]> {
  return simulateNetworkCall(() => {
    return getTicketsByEmail(userEmail);
  });
}

/**
 * Create a new ticket for a user.
 * Validates against duplicates (same title + open status within 24h).
 */
export async function createNewTicket(
  payload: CreateTicketPayload,
  userEmail: string
): Promise<{ ticket: Ticket; isDuplicate: boolean }> {
  return simulateNetworkCall(() => {
    // Duplicate detection
    const existing = getTicketsByEmail(userEmail);
    const recentCutoff = Date.now() - 24 * 60 * 60 * 1000;
    const duplicate = existing.find((t) => {
      const isSameTitle =
        t.title.toLowerCase().trim() === payload.title.toLowerCase().trim();
      const isRecent = new Date(t.createdAt).getTime() > recentCutoff;
      const isOpen = ["open", "in_progress", "waiting_user"].includes(t.status);
      return isSameTitle && isRecent && isOpen;
    });

    if (duplicate) {
      return { ticket: duplicate, isDuplicate: true };
    }

    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: generateTicketId(),
      title: payload.title,
      description: payload.description,
      status: "open",
      priority: payload.priority,
      type: payload.type,
      category: payload.category,
      userEmail: userEmail,
      createdAt: now,
      updatedAt: now,
    };

    return { ticket: createTicket(ticket), isDuplicate: false };
  });
}

/**
 * Update a ticket — only if it belongs to the requesting user.
 */
export async function updateUserTicket(
  ticketId: string,
  updates: UpdateTicketPayload,
  requestingUserEmail: string
): Promise<Ticket> {
  return simulateNetworkCall(() => {
    const ticket = getTicketById(ticketId);

    if (!ticket) {
      throw new Error(`Chamado ${ticketId} não encontrado.`);
    }

    // Strict data isolation — users can only update their own tickets
    if (ticket.userEmail.toLowerCase() !== requestingUserEmail.toLowerCase()) {
      throw new Error(
        `Acesso negado: você não tem permissão para alterar o chamado ${ticketId}.`
      );
    }

    const updated = updateTicket(ticketId, updates);
    if (!updated) {
      throw new Error(`Falha ao atualizar o chamado ${ticketId}.`);
    }

    return updated;
  });
}

/**
 * Get a single ticket by ID — enforces user isolation.
 */
export async function getTicket(
  ticketId: string,
  requestingUserEmail: string
): Promise<Ticket> {
  return simulateNetworkCall(() => {
    const ticket = getTicketById(ticketId);

    if (!ticket) {
      throw new Error(`Chamado ${ticketId} não encontrado.`);
    }

    if (ticket.userEmail.toLowerCase() !== requestingUserEmail.toLowerCase()) {
      throw new Error(`Acesso negado ao chamado ${ticketId}.`);
    }

    return ticket;
  });
}

// Allow analysts to bypass isolation checks
export async function getTicketAsAnalyst(ticketId: string): Promise<Ticket> {
  return simulateNetworkCall(() => {
    const ticket = getTicketById(ticketId);
    if (!ticket) throw new Error(`Chamado ${ticketId} não encontrado.`);
    return ticket;
  });
}
