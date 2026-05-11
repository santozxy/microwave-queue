"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Trash2,
  UserRoundCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  createTrashAssignmentRequest,
  fetchTrashWeekSnapshot,
  getTodayIsoDate,
  removeTrashAssignmentRequest,
} from "@/domains/trash-rotation/client";
import {
  createTrashWeekSnapshot,
  type TrashAssignment,
  type TrashWeekSnapshot,
} from "@/domains/trash-rotation/types";
import { employees } from "@/lib/employees";

function shiftIsoDateByDays(date: string, amount: number) {
  const shiftedDate = new Date(`${date}T12:00:00Z`);
  shiftedDate.setUTCDate(shiftedDate.getUTCDate() + amount);
  return shiftedDate.toISOString().slice(0, 10);
}

function formatWeekRange(weekDates: string[]) {
  if (weekDates.length === 0) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });

  return `${formatter.format(new Date(`${weekDates[0]}T12:00:00Z`))} até ${formatter.format(new Date(`${weekDates[6]}T12:00:00Z`))}`;
}

function formatWeekDateLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatWeekday(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatMonthDay(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function TrashRotation() {
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [weekSnapshot, setWeekSnapshot] = useState<TrashWeekSnapshot | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const assignedParticipants = useMemo(
    () => new Set(weekSnapshot?.assignedParticipants ?? []),
    [weekSnapshot],
  );

  const currentAssignment = weekSnapshot?.assignments.find(
    (assignment) => assignment.date === selectedDate,
  );
  const selectedWeekRange = weekSnapshot
    ? formatWeekRange(weekSnapshot.weekDates)
    : "Carregando semana...";
  const assignedCount = weekSnapshot?.assignments.length ?? 0;
  const availableCount =
    weekSnapshot?.availableParticipants.length ?? employees.length;

  async function loadWeek(date: string) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchTrashWeekSnapshot(date);
      setWeekSnapshot(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os registros.";
      setErrorMessage(message);
      setWeekSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadWeek(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!weekSnapshot) {
      return;
    }

    setSelectedPeople((currentSelection) =>
      currentSelection.filter((person) =>
        weekSnapshot.availableParticipants.includes(person),
      ),
    );
  }, [weekSnapshot]);

  const handlePersonToggle = (person: string) => {
    if (assignedParticipants.has(person)) {
      return;
    }

    setSelectedPeople((currentSelection) =>
      currentSelection.includes(person)
        ? currentSelection.filter((item) => item !== person)
        : [...currentSelection, person],
    );
  };

  const selectAllEligible = () => {
    setSelectedPeople(weekSnapshot?.availableParticipants ?? []);
  };

  const clearSelection = () => {
    setSelectedPeople([]);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setFeedbackMessage(null);
    setErrorMessage(null);
  };

  const goToPreviousWeek = () => {
    handleSelectDate(shiftIsoDateByDays(selectedDate, -7));
  };

  const goToNextWeek = () => {
    handleSelectDate(shiftIsoDateByDays(selectedDate, 7));
  };

  const buildOptimisticSnapshot = (assignments: TrashAssignment[]) =>
    createTrashWeekSnapshot(selectedDate, assignments);

  const handleGenerateAssignment = async () => {
    if (selectedPeople.length === 0 || !weekSnapshot) {
      return;
    }

    const eligibleParticipants = selectedPeople.filter(
      (person) => !assignedParticipants.has(person),
    );

    if (eligibleParticipants.length === 0) {
      return;
    }

    const optimisticAssignee =
      eligibleParticipants[
        Math.floor(Math.random() * eligibleParticipants.length)
      ];
    const previousSnapshot = weekSnapshot;
    const previousSelection = selectedPeople;
    const optimisticAssignment: TrashAssignment = {
      assignee: optimisticAssignee,
      createdAt: new Date().toISOString(),
      date: selectedDate,
      participants: selectedPeople,
      weekKey: weekSnapshot.weekKey,
    };
    const optimisticSnapshot = buildOptimisticSnapshot([
      ...weekSnapshot.assignments.filter(
        (assignment) => assignment.date !== selectedDate,
      ),
      optimisticAssignment,
    ]);

    setIsSaving(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    setWeekSnapshot(optimisticSnapshot);
    setSelectedPeople([]);

    try {
      const data = await createTrashAssignmentRequest(
        selectedDate,
        selectedPeople,
        optimisticAssignee,
      );

      setFeedbackMessage(data.message ?? "Rodízio salvo com sucesso.");

      if (data.snapshot) {
        setWeekSnapshot(data.snapshot);
      } else {
        await loadWeek(selectedDate);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o rodízio.";
      setWeekSnapshot(previousSnapshot);
      setSelectedPeople(previousSelection);
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!currentAssignment || !weekSnapshot) {
      return;
    }

    const previousSnapshot = weekSnapshot;
    const optimisticSnapshot = buildOptimisticSnapshot(
      weekSnapshot.assignments.filter(
        (assignment) => assignment.date !== selectedDate,
      ),
    );

    setIsRemoving(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    setWeekSnapshot(optimisticSnapshot);

    try {
      const data = await removeTrashAssignmentRequest(selectedDate);
      setFeedbackMessage(data.message ?? "Responsável removido com sucesso.");

      if (data.snapshot) {
        setWeekSnapshot(data.snapshot);
      } else {
        await loadWeek(selectedDate);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível remover o rodízio.";
      setWeekSnapshot(previousSnapshot);
      setErrorMessage(message);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="min-h-136 border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Participantes</CardTitle>
              </div>
              <CardDescription>
                {selectedPeople.length} de {availableCount} selecionados
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllEligible}>
                Todos
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {feedbackMessage && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {feedbackMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {employees.map((person) => {
              const isAssigned = assignedParticipants.has(person);
              const isSelected = selectedPeople.includes(person);

              return (
                <button
                  key={person}
                  type="button"
                  onClick={() => handlePersonToggle(person)}
                  disabled={isAssigned}
                  className={[
                    "rounded-lg border-2 p-3 text-left transition-all",
                    isAssigned
                      ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-60"
                      : isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent text-card-foreground",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {person}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {isAssigned
                          ? "Indisponível nesta semana"
                          : isSelected
                            ? "Selecionado para o sorteio"
                            : "Disponível para participar"}
                      </span>
                    </div>
                    {isAssigned ? (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                        Já saiu
                      </span>
                    ) : isSelected ? (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>

        <CardFooter>
          <div className="w-full space-y-3">
            <Button
              onClick={handleGenerateAssignment}
              disabled={
                isLoading ||
                isSaving ||
                isRemoving ||
                currentAssignment !== undefined ||
                selectedPeople.length === 0
              }
              size="lg"
              className="w-full"
            >
              <UserRoundCheck
                className={`mr-2 h-5 w-5 ${isSaving ? "animate-spin" : ""}`}
              />
              {isSaving ? "Salvando rodízio..." : "Sortear responsável do dia"}
            </Button>

            {selectedPeople.length === 0 && !currentAssignment && (
              <p className="text-center text-xs text-muted-foreground">
                Selecione pelo menos uma pessoa para sortear o responsável
              </p>
            )}
          </div>
        </CardFooter>
      </Card>

      <Card className="min-h-136 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Trash2 className="h-5 w-5" />
                Dias e Responsável
              </CardTitle>
              <CardDescription>
                {weekSnapshot
                  ? `${assignedCount} dia(s) preenchido(s) • Semana ${selectedWeekRange}`
                  : "Os dias aparecerão aqui após carregar a semana"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousWeek}
                aria-label="Semana anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextWeek}
                aria-label="Próxima semana"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadWeek(selectedDate)}
                disabled={isLoading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {weekSnapshot?.weekDates && weekSnapshot.weekDates.length > 0 ? (
            <>
              <ScrollArea className="w-full whitespace-nowrap pb-3">
                <div className="flex min-w-max gap-3">
                  {weekSnapshot.weekDates.map((date) => {
                    const assignment = weekSnapshot.assignments.find(
                      (item) => item.date === date,
                    );
                    const isSelectedDay = date === selectedDate;

                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => handleSelectDate(date)}
                        className={[
                          "group min-h-28 w-32 shrink-0 rounded-2xl border p-3 text-left transition-all",
                          isSelectedDay
                            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : assignment
                              ? "border-primary/20 bg-primary/8 hover:border-primary/40 hover:bg-primary/12"
                              : "border-border bg-card hover:border-primary/30 hover:bg-accent",
                        ].join(" ")}
                      >
                        <div className="flex h-full min-w-0 flex-col justify-between">
                          <div>
                            <p
                              className={[
                                "text-[11px] font-semibold uppercase tracking-[0.18em]",
                                isSelectedDay
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground group-hover:text-foreground",
                              ].join(" ")}
                            >
                              {formatWeekday(date)}
                            </p>
                            <p className="mt-2 text-lg font-semibold">
                              {formatMonthDay(date)}
                            </p>
                          </div>
                          <div className="mt-4 flex items-end justify-between gap-3">
                            <p
                              className={[
                                "min-w-0 truncate text-xs",
                                isSelectedDay
                                  ? "text-primary-foreground/80"
                                  : assignment
                                    ? "text-primary"
                                    : "text-muted-foreground",
                              ].join(" ")}
                            >
                              {assignment ? assignment.assignee : "Disponível"}
                            </p>
                            {isSelectedDay && (
                              <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                                Dia
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
                        ficou responsável pelo lixo em{" "}
                        {formatWeekDateLabel(selectedDate)}.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAssignment}
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
    </div>
  );
}
