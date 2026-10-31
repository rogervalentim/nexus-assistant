// ============================================================
// Nexo Assist — API: Sessions (Analyst Console)
// GET /api/sessions        — list sessions (for analyst)
// POST /api/sessions       — create or get session (for chat)
// ============================================================
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getAllSessions,
  getSessionByEmail,
  createSession,
  updateSession,
} from "@/lib/data/store";
import { EMPLOYEES } from "@/lib/data/seed";
import type { Session } from "@/lib/types";

// GET — list all sessions (analyst view)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const sessions = getAllSessions();
  const filtered = status
    ? sessions.filter((s) => s.status === status)
    : sessions;

  // Sort by most recent first
  const sorted = filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return Response.json({
    sessions: sorted.map((s) => ({
      id: s.id,
      userEmail: s.userEmail,
      userName: s.userName,
      status: s.status,
      messageCount: s.messageCount,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      escalationReason: s.escalationReason,
      analystId: s.analystId,
      lastMessage: s.messages[s.messages.length - 1]?.content?.slice(0, 120),
    })),
  });
}

// POST — create or retrieve session for a user
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userEmail: string; forceNew?: boolean };
    const { userEmail, forceNew } = body;

    if (!userEmail) {
      return Response.json({ error: "E-mail obrigatório." }, { status: 400 });
    }

    // Check for existing active session
    const existing = getSessionByEmail(userEmail);
    if (existing && !forceNew) {
      return Response.json({ session: existing });
    }

    if (existing && forceNew) {
      updateSession(existing.id, { status: "closed" });
    }

    // Find employee name
    const employee = EMPLOYEES.find(
      (e) => e.email.toLowerCase() === userEmail.toLowerCase()
    );
    const now = new Date().toISOString();

    const session: Session = {
      id: uuidv4(),
      userEmail,
      userName: employee?.name ?? userEmail,
      status: "active",
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    const saved = createSession(session);
    return Response.json({ session: saved }, { status: 201 });
  } catch {
    return Response.json({ error: "Erro ao criar sessão." }, { status: 500 });
  }
}
