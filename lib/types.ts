// ============================================================
// Nexo Assist — Shared Types
// ============================================================

export type TicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketType = "incident" | "request" | "problem" | "change";
export type TicketCategory =
  | "hardware"
  | "software"
  | "network"
  | "access"
  | "email"
  | "vpn"
  | "printer"
  | "other";

export type SessionStatus =
  | "active"           // Agent is handling it
  | "waiting_analyst"  // Escalated, awaiting human
  | "with_analyst"     // Analyst assumed the conversation
  | "closed";

export type MessageRole = "user" | "assistant" | "system";

// ─── Agent Transparency ─────────────────────────────────────

export interface AgentStep {
  tool: string;
  description: string;     // Human-readable, e.g. "Consultou chamados"
  input: unknown;
  output: unknown;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
}

export interface AgentThinking {
  reasoning?: string;      // Internal LLM reasoning if available
  confidence?: number;     // 0-1 confidence estimate
  steps: AgentStep[];
}

// ─── Messages ───────────────────────────────────────────────

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;       // ISO timestamp
  thinking?: AgentThinking; // Only on assistant messages
}

// ─── Tickets ────────────────────────────────────────────────

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  category: TicketCategory;
  userEmail: string;
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
  type: TicketType;
  category: TicketCategory;
  userEmail: string;
}

export interface UpdateTicketPayload {
  status?: TicketStatus;
  priority?: TicketPriority;
  description?: string;
  resolution?: string;
  assignedTo?: string;
}

// ─── Sessions / Conversations ────────────────────────────────

export interface Session {
  id: string;
  userEmail: string;
  userName: string;
  status: SessionStatus;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  escalationReason?: string;
  analystId?: string;
}

// ─── Employees ──────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isAnalyst: boolean;
}

// ─── API Responses ──────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
}

export interface ChatRequest {
  sessionId?: string;
  userEmail: string;
  message: string;
}

export interface ChatStreamChunk {
  type: "text" | "step" | "done" | "error" | "session";
  payload: unknown;
}

// Knowledge Base
export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: TicketCategory | "general";
  tags: string[];
}
