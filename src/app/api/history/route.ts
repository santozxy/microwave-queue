import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const historyFilePath = path.join(process.cwd(), "history.json");

type HistoryModule = "fila-almoco" | "dia-do-lixo" | "sistema";

interface HistoryEvent {
  id: string;
  timestamp: string;
  module: HistoryModule;
  action: string;
  details?: string;
}

interface CreateHistoryEventInput {
  module: HistoryModule;
  action: string;
  details?: string;
}

async function ensureHistoryFile() {
  try {
    await fs.access(historyFilePath);
  } catch {
    await fs.writeFile(historyFilePath, "[]", "utf-8");
  }
}

async function readHistory(): Promise<HistoryEvent[]> {
  await ensureHistoryFile();
  const rawContent = await fs.readFile(historyFilePath, "utf-8");

  try {
    const parsed = JSON.parse(rawContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeHistory(events: HistoryEvent[]) {
  await fs.writeFile(historyFilePath, JSON.stringify(events, null, 2), "utf-8");
}

export async function GET() {
  const events = await readHistory();
  return NextResponse.json(events.slice().reverse(), { status: 200 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateHistoryEventInput;

  if (!body?.module || !body?.action) {
    return NextResponse.json(
      { message: "module e action sao obrigatorios" },
      { status: 400 },
    );
  }

  const currentEvents = await readHistory();
  const newEvent: HistoryEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    module: body.module,
    action: body.action,
    details: body.details,
  };

  currentEvents.push(newEvent);
  await writeHistory(currentEvents);

  return NextResponse.json(newEvent, { status: 201 });
}

export async function DELETE() {
  await writeHistory([]);

  return NextResponse.json(
    { message: "Historico limpo com sucesso" },
    { status: 200 },
  );
}
