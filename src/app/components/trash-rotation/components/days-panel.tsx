"use client";

import { ChevronLeft, ChevronRight, RefreshCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { type TrashAssignment } from "@/domains/trash-rotation/types";

interface DayItem {
  assignee?: string;
  date: string;
  dayLabel: string;
  fullLabel: string;
  isSelected: boolean;
  monthDayLabel: string;
}

interface DaysPanelProps {
  assignedCount: number;
  currentAssignment: TrashAssignment | undefined;
  days: DayItem[];
  isLoading: boolean;
  isRemoving: boolean;
  isSaving: boolean;
  onLoadWeek: () => void;
  onNextWeek: () => void;
  onPreviousWeek: () => void;
  onRemoveAssignment: () => void;
  onSelectDate: (date: string) => void;
  selectedWeekRange: string;
  weekLoaded: boolean;
}

export function DaysPanel({
  assignedCount,
  currentAssignment,
  days,
  isLoading,
  isRemoving,
  isSaving,
  onLoadWeek,
  onNextWeek,
  onPreviousWeek,
  onRemoveAssignment,
  onSelectDate,
  selectedWeekRange,
  weekLoaded,
}: DaysPanelProps) {
  return (
    <Card className="min-h-136 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <Trash2 className="h-5 w-5" />
              Dias e Responsável
            </CardTitle>
            <CardDescription>
              {weekLoaded
                ? `${assignedCount} dia(s) preenchido(s) • Semana ${selectedWeekRange}`
                : "Os dias aparecerão aqui após carregar a semana"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onPreviousWeek}
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextWeek}
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadWeek}
              disabled={isLoading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {weekLoaded ? (
          <>
            <ScrollArea className="w-full whitespace-nowrap pb-3">
              <div className="flex min-w-max gap-3">
                {days.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => onSelectDate(day.date)}
                    className={[
                      "group min-h-28 w-32 shrink-0 rounded-2xl border p-3 text-left transition-all",
                      day.isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : day.assignee
                          ? "border-primary/20 bg-primary/8 hover:border-primary/40 hover:bg-primary/12"
                          : "border-border bg-card hover:border-primary/30 hover:bg-accent",
                    ].join(" ")}
                  >
                    <div className="flex h-full min-w-0 flex-col justify-between">
                      <div>
                        <p
                          className={[
                            "text-[11px] font-semibold uppercase tracking-[0.18em]",
                            day.isSelected
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground group-hover:text-foreground",
                          ].join(" ")}
                        >
                          {day.dayLabel}
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {day.monthDayLabel}
                        </p>
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <p
                          className={[
                            "min-w-0 truncate text-xs",
                            day.isSelected
                              ? "text-primary-foreground/80"
                              : day.assignee
                                ? "text-primary"
                                : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {day.assignee ?? "Disponível"}
                        </p>
                        {day.isSelected && (
                          <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                            Dia
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {currentAssignment ? (
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Responsável do dia
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      <span className="font-semibold">
                        {currentAssignment.assignee}
                      </span>{" "}
                      ficou responsável pelo lixo em {days.find((day) => day.isSelected)?.fullLabel}.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRemoveAssignment}
                    disabled={isRemoving || isSaving}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isRemoving ? "Removendo..." : "Remover do dia"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-96 items-center justify-center">
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Trash2 className="h-8 w-8 text-primary/60" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Nenhum responsável definido ainda
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground/80">
                      Selecione um dia e sorteie uma pessoa na coluna da
                      esquerda
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-96 items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Trash2 className="h-8 w-8 text-primary/60" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Carregando a semana
                </p>
                <p className="mt-1 text-sm text-muted-foreground/80">
                  Aguarde enquanto buscamos os dias e responsáveis
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
