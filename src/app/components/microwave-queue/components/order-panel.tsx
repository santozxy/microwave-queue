"use client";

import { ArrowLeftRight, Clock, GripVertical } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmployeeAvatar } from "@/app/components/employee-avatar";

import { type QueueItem } from "./types";

interface OrderPanelProps {
  dragOverIndex: number | null;
  draggingIndex: number | null;
  onDragEnd: () => void;
  onDragLeave: () => void;
  onDragOver: (event: React.DragEvent, index: number) => void;
  onDragStart: (event: React.DragEvent, index: number) => void;
  onDrop: (event: React.DragEvent, index: number) => void;
  queueOrder: QueueItem[];
}

export function OrderPanel({
  dragOverIndex,
  draggingIndex,
  onDragEnd,
  onDragLeave,
  onDragOver,
  onDragStart,
  onDrop,
  queueOrder,
}: OrderPanelProps) {
  return (
    <Card className="min-h-136 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Clock className="h-5 w-5" />
          Ordem da fila
        </CardTitle>
        <CardDescription>
          {queueOrder.length > 0
            ? `Do primeiro ao último • ${queueOrder.length} pessoas • Arraste para trocar posições`
            : "A fila aparecerá aqui após gerar a ordem"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {queueOrder.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {queueOrder.map((item, index) => (
              <div
                key={item.name}
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onDragOver={(event) => onDragOver(event, index)}
                onDragLeave={onDragLeave}
                onDrop={(event) => onDrop(event, index)}
                onDragEnd={onDragEnd}
                className={[
                  "flex items-center justify-between rounded-lg border-2 p-3 transition-all select-none",
                  "cursor-grab active:cursor-grabbing",
                  index === 0 ? "sm:col-span-2" : "",
                  draggingIndex === index
                    ? "scale-95 opacity-40"
                    : dragOverIndex === index
                      ? "scale-105 border-primary bg-primary/20 shadow-lg"
                      : index === 0
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-card hover:border-primary/40",
                ].join(" ")}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div
                    className={[
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {index + 1}
                  </div>
                  <EmployeeAvatar
                    name={item.name}
                    className={index === 0 ? "border-primary/40" : ""}
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={[
                        "block truncate text-sm font-semibold",
                        index === 0 ? "text-primary" : "text-card-foreground",
                      ].join(" ")}
                    >
                      {item.name}
                    </span>
                    {item.previousPosition !== null && (
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowLeftRight className="h-3 w-3" />
                        Antes: {item.previousPosition}º
                      </span>
                    )}
                  </div>
                </div>

                {index === 0 && (
                  <span className="ml-2 shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Próximo
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-96 items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary/60" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Nenhuma fila gerada ainda
                </p>
                <p className="mt-1 text-sm text-muted-foreground/80">
                  Selecione os participantes e clique em &quot;Gerar ordem
                  aleatória&quot;
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
