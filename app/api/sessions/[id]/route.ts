// ============================================================
// Nexo Assist — API: Single Session
// GET  /api/sessions/[id]   — full session with messages
// PATCH /api/sessions/[id]  — update status, analyst actions
// POST /api/sessions/[id]   — send message (e.g., analyst to user)
// ============================================================
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSessionById, updateSession } from "@/lib/data/store";
import type { Message } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/sessions/[id]">
) {
  const { id } = await ctx.params;
  const session = getSessionById(id);

  if (!session) {
    return Response.json({ error: "Sessão não encontrada." }, { status: 404 });
  }

  return Response.json({ session });
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/sessions/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json() as Record<string, unknown>;

    const updated = updateSession(id, body);
    if (!updated) {
      return Response.json({ error: "Sessão não encontrada." }, { status: 404 });
    }

    return Response.json({ session: updated });
  } catch {
    return Response.json({ error: "Erro ao atualizar sessão." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/sessions/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      content: string;
      role?: "user" | "assistant";
      senderName?: string;
    };

    const session = getSessionById(id);
    if (!session) {
      return Response.json({ error: "Sessão não encontrada." }, { status: 404 });
    }

    const newMessage: Message = {
      id: uuidv4(),
      role: body.role ?? "assistant",
      content: body.senderName ? `[${body.senderName}]: ${body.content}` : body.content,
      createdAt: new Date().toISOString(),
    };

    const updated = updateSession(id, {
      messages: [...(session.messages ?? []), newMessage],
      messageCount: (session.messageCount ?? 0) + 1,
    });

    return Response.json({ session: updated, message: newMessage });
  } catch {
    return Response.json({ error: "Erro ao adicionar mensagem." }, { status: 500 });
  }
}
