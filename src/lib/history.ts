export interface HistoryEvent {
  id: string;
  timestamp: string;
  module: "fila-almoco" | "dia-do-lixo" | "sistema";
  action: string;
  details?: string;
}

interface LogHistoryEventInput {
  module: HistoryEvent["module"];
  action: string;
  details?: string;
}

export async function logHistoryEvent(input: LogHistoryEventInput) {
  try {
    await fetch("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch {
    // Fail silently to avoid blocking UI interactions.
  }
}
