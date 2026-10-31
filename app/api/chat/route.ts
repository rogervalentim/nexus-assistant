// ============================================================
// Nexo Assist — API: Chat (Streaming with Transparency)
// POST /api/chat
// Returns: text/event-stream (SSE)
// ============================================================
import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { v4 as uuidv4 } from "uuid";
import {
  getSessionById,
  getSessionByEmail,
  createSession,
  updateSession,
} from "@/lib/data/store";
import { EMPLOYEES } from "@/lib/data/seed";
import { buildAgentTools } from "@/lib/agent/tools";
import { NEXO_ASSIST_SYSTEM_PROMPT } from "@/lib/agent/prompt";
import { runAgentSimulator } from "@/lib/agent/simulator";
import type { AgentStep, Message, Session } from "@/lib/types";

export const maxDuration = 60;

function hasValidOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(
    key &&
    key.trim().length > 0 &&
    key !== "sk-placeholder" &&
    !key.startsWith("sk-your-")
  );
}

function getAIProvider() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;

  const openai = createOpenAI({
    apiKey: apiKey ?? "sk-placeholder",
    ...(baseURL ? { baseURL } : {}),
  });

  return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}

function encodeSSE(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    sessionId?: string;
    userEmail: string;
    message: string;
  };

  const { userEmail, message } = body;
  let { sessionId } = body;

  if (!userEmail || !message) {
    return Response.json(
      { error: "userEmail e message são obrigatórios." },
      { status: 400 }
    );
  }

  // ── Resolve session ─────────────────────────────────────────
  let session: Session | undefined;

  if (sessionId) {
    session = getSessionById(sessionId);
  }

  if (!session) {
    session = getSessionByEmail(userEmail);
  }

  if (!session) {
    const employee = EMPLOYEES.find(
      (e) => e.email.toLowerCase() === userEmail.toLowerCase()
    );
    const now = new Date().toISOString();
    session = createSession({
      id: uuidv4(),
      userEmail,
      userName: employee?.name ?? userEmail,
      status: "active",
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
      messages: [],
    });
  }

  sessionId = session.id;

  // ── Session closed ──────────────────────────────────────────
  if (session.status === "closed") {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encodeSSE({
            type: "error",
            payload:
              "Esta sessão foi encerrada. Por favor, faça login novamente para iniciar uma nova conversa.",
          })
        );
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  // ── Session message limit ─────────────────────────────────────
  const MSG_LIMIT = 30;
  const currentCount = session.messageCount ?? 0;

  if (currentCount >= MSG_LIMIT) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encodeSSE({
            type: "error",
            payload: `Esta sessão atingiu o limite de ${MSG_LIMIT} mensagens. Por favor, faça login novamente para iniciar uma nova conversa.`,
          })
        );
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  // ── Save user message ─────────────────────────────────────────
  const userMsg: Message = {
    id: uuidv4(),
    role: "user",
    content: message,
    createdAt: new Date().toISOString(),
  };

  const updatedMessages = [...(session.messages ?? []), userMsg];
  const newCount = currentCount + 1;

  updateSession(sessionId, {
    messages: updatedMessages,
    messageCount: newCount,
  });

  const encoder = new TextEncoder();

  // ── If with analyst or waiting analyst, pass message to session ──
  if (session.status === "with_analyst" || session.status === "waiting_analyst") {
    const isWith = session.status === "with_analyst";
    const notificationText = isWith
      ? "Sua mensagem foi recebida e encaminhada ao analista humano que está atendendo seu chamado. Aguarde a resposta dele por aqui."
      : "Sua mensagem foi adicionada ao histórico da conversa. Você está na fila de atendimento e um analista humano assumirá em breve.";

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            encodeSSE({
              type: "session",
              payload: { sessionId, messageCount: newCount },
            })
          )
        );

        // Stream notification text
        const words = notificationText.split(" ");
        for (const w of words) {
          controller.enqueue(
            encoder.encode(encodeSSE({ type: "text", payload: w + " " }))
          );
          await new Promise((r) => setTimeout(r, 20));
        }

        const assistantMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content: notificationText,
          createdAt: new Date().toISOString(),
        };

        updateSession(sessionId!, {
          messages: [...updatedMessages, assistantMsg],
          messageCount: newCount + 1,
        });

        controller.enqueue(
          encoder.encode(
            encodeSSE({
              type: "done",
              payload: {
                messageId: assistantMsg.id,
                steps: [],
                messageCount: newCount + 1,
              },
            })
          )
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // ── Build message history for LLM ───────────────────────────
  const warningNote =
    newCount === 25
      ? "\n\n[SISTEMA: Esta sessão está próxima do limite de 30 mensagens. Avise o usuário gentilmente.]"
      : "";

  const systemWithContext = `${NEXO_ASSIST_SYSTEM_PROMPT}

## Contexto da Sessão Atual
- Usuário autenticado: ${userEmail}
- Nome do funcionário: ${session.userName}
- ID da sessão: ${sessionId}
- Mensagem ${newCount} de ${MSG_LIMIT}${warningNote}`;

  const coreMessages: { role: "user" | "assistant"; content: string }[] =
    updatedMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

  // ── Collect steps for transparency ───────────────────────────
  const steps: AgentStep[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(
            encodeSSE({
              type: "session",
              payload: { sessionId, messageCount: newCount },
            })
          )
        );

        const tools = buildAgentTools({
          sessionId,
          userEmail,
          onStep: (step) => {
            steps.push(step);
            controller.enqueue(
              encoder.encode(encodeSSE({ type: "step", payload: step }))
            );
          },
        });

        let fullText = "";
        let confidence = 0.95;
        let reasoning = "Decisão baseada nas regras de service desk Nexo Assist.";

        if (hasValidOpenAIKey()) {
          try {
            const result = streamText({
              model: getAIProvider(),
              system: systemWithContext,
              messages: coreMessages,
              tools,
              temperature: 0.3,
              onChunk: ({ chunk }) => {
                if (chunk.type === "text-delta") {
                  const delta =
                    "text" in chunk && typeof chunk.text === "string"
                      ? chunk.text
                      : "";
                  fullText += delta;
                  controller.enqueue(
                    encoder.encode(
                      encodeSSE({ type: "text", payload: delta })
                    )
                  );
                } else if (chunk.type === "tool-call") {
                  controller.enqueue(
                    encoder.encode(
                      encodeSSE({
                        type: "step",
                        payload: {
                          tool: chunk.toolName,
                          status: "running",
                        },
                      })
                    )
                  );
                }
              },
            });

            await result.text;
          } catch {
            // Fallback to simulator if API call fails
            const simResult = await runAgentSimulator({
              sessionId,
              userEmail,
              userName: session?.userName,
              message,
              messageHistory: updatedMessages,
              tools,
              onStep: (s) => steps.push(s),
              onTextDelta: async (delta) => {
                fullText += delta;
                controller.enqueue(
                  encoder.encode(encodeSSE({ type: "text", payload: delta }))
                );
              },
            });
            fullText = simResult.fullText;
            confidence = simResult.confidence;
            reasoning = simResult.reasoning;
          }
        } else {
          // Autonomous agent simulator with actual tools and transparency
          const simResult = await runAgentSimulator({
            sessionId,
            userEmail,
            userName: session?.userName,
            message,
            messageHistory: updatedMessages,
            tools,
            onStep: (s) => steps.push(s),
            onTextDelta: async (delta) => {
              fullText += delta;
              controller.enqueue(
                encoder.encode(encodeSSE({ type: "text", payload: delta }))
              );
            },
          });
          fullText = simResult.fullText;
          confidence = simResult.confidence;
          reasoning = simResult.reasoning;
        }

        // Save assistant message
        const assistantMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content: fullText,
          createdAt: new Date().toISOString(),
          thinking: {
            steps,
            confidence,
            reasoning,
          },
        };

        const finalMessages = [...updatedMessages, assistantMsg];
        const finalCount = newCount + 1;

        updateSession(sessionId!, {
          messages: finalMessages,
          messageCount: finalCount,
        });

        controller.enqueue(
          encoder.encode(
            encodeSSE({
              type: "done",
              payload: {
                messageId: assistantMsg.id,
                steps,
                confidence,
                reasoning,
                messageCount: finalCount,
              },
            })
          )
        );
      } catch (err) {
        const errMsg =
          err instanceof Error
            ? err.message
            : "Erro interno ao processar sua mensagem.";
        controller.enqueue(
          encoder.encode(encodeSSE({ type: "error", payload: errMsg }))
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
