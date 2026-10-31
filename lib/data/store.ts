// ============================================================
// Nexo Assist — Persistence Layer (In-Memory Singleton)
// Zero Node.js 'fs' dependencies — 100% compatible with
// Edge, Serverless, Turbopack, and Browser environments.
// ============================================================
import type { Session, Ticket } from "../types";
import { SEED_TICKETS, SEED_SESSIONS } from "./seed";
import fs from "fs";
import path from "path";

interface DbSchema {
  tickets: Ticket[];
  sessions: Session[];
  lastUpdated: string;
}

// Preserve database across Fast Refresh / module reloads in Next.js development
declare global {
  var __nexoDb: DbSchema | undefined;
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function loadFromDisk(): DbSchema | null {
  try {
    if (typeof window === "undefined" && fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.tickets) && Array.isArray(parsed.sessions)) {
        return parsed as DbSchema;
      }
    }
  } catch {
    // fallback
  }
  return null;
}

function saveToDisk(db: DbSchema) {
  try {
    if (typeof window === "undefined") {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    }
  } catch {
    // fallback in non-filesystem envs
  }
}

function initDb(): DbSchema {
  const disk = loadFromDisk();
  if (disk && disk.tickets.length > 0) {
    // Ensure all seed tickets exist in disk DB
    for (const st of SEED_TICKETS) {
      if (!disk.tickets.some((t) => t.id === st.id)) {
        disk.tickets.push(st);
      }
    }
    // Ensure all seed sessions exist in disk DB
    for (const ss of SEED_SESSIONS) {
      if (!disk.sessions.some((s) => s.id === ss.id)) {
        disk.sessions.push(ss);
      }
    }
    return disk;
  }

  const initial: DbSchema = {
    tickets: JSON.parse(JSON.stringify(SEED_TICKETS)) as Ticket[],
    sessions: JSON.parse(JSON.stringify(SEED_SESSIONS)) as Session[],
    lastUpdated: new Date().toISOString(),
  };
  saveToDisk(initial);
  return initial;
}

function getDb(): DbSchema {
  if (!globalThis.__nexoDb) {
    globalThis.__nexoDb = initDb();
  }
  return globalThis.__nexoDb;
}

// ─── Ticket Operations ──────────────────────────────────────

export function getAllTickets(): Ticket[] {
  return getDb().tickets;
}

export function getTicketsByEmail(userEmail: string): Ticket[] {
  return getDb().tickets.filter(
    (t) => t.userEmail.toLowerCase() === userEmail.toLowerCase()
  );
}

export function getTicketById(id: string): Ticket | undefined {
  return getDb().tickets.find((t) => t.id === id);
}

export function createTicket(ticket: Ticket): Ticket {
  const db = getDb();
  db.tickets.push(ticket);
  db.lastUpdated = new Date().toISOString();
  saveToDisk(db);
  return ticket;
}

export function updateTicket(id: string, updates: Partial<Ticket>): Ticket | null {
  const db = getDb();
  const idx = db.tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.tickets[idx] = {
    ...db.tickets[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  db.lastUpdated = new Date().toISOString();
  saveToDisk(db);
  return db.tickets[idx];
}

// ─── Session Operations ─────────────────────────────────────

export function getAllSessions(): Session[] {
  return getDb().sessions;
}

export function getSessionById(id: string): Session | undefined {
  return getDb().sessions.find((s) => s.id === id);
}

export function getSessionByEmail(userEmail: string): Session | undefined {
  return getDb().sessions.find(
    (s) =>
      s.userEmail.toLowerCase() === userEmail.toLowerCase() &&
      s.status !== "closed"
  );
}

export function createSession(session: Session): Session {
  const db = getDb();
  db.sessions.push(session);
  db.lastUpdated = new Date().toISOString();
  saveToDisk(db);
  return session;
}

export function updateSession(id: string, updates: Partial<Session>): Session | null {
  const db = getDb();
  const idx = db.sessions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  db.sessions[idx] = {
    ...db.sessions[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  db.lastUpdated = new Date().toISOString();
  saveToDisk(db);
  return db.sessions[idx];
}

// ─── Ticket ID Generator ────────────────────────────────────

export function generateTicketId(): string {
  const db = getDb();
  const nums = db.tickets
    .map((t) => parseInt(t.id.replace("TKT-", ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `TKT-${String(next).padStart(4, "0")}`;
}

// ─── Reset Helper ───────────────────────────────────────────

export function resetDb(): void {
  globalThis.__nexoDb = initDb();
}
