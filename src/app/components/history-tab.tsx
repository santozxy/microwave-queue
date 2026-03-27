"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { HistoryEvent } from "@/lib/history";
import { History, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function HistoryTab() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/history", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as HistoryEvent[];
      setEvents(data);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    await fetch("/api/history", { method: "DELETE" });
    await loadHistory();
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  return (
    <div className="h-full bg-background p-4 flex flex-col overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col h-full w-full">
        <div className="text-center mb-6 shrink-0">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <History className="h-7 w-7 text-primary" />
            Historico
          </h1>
          <p className="text-muted-foreground mt-1">
            Tudo que acontece nos modulos fica salvo em history.json
          </p>
        </div>

        <Card className="flex-1 min-h-0 flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Eventos</CardTitle>
                <CardDescription>
                  {events.length} evento(s) registrado(s)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadHistory}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button variant="destructive" onClick={clearHistory}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum evento registrado ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground">
                        [{event.module}] {event.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {event.details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
