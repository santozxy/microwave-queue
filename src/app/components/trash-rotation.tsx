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
import {
  createTrashAssignmentRequest,
  fetchTrashWeekSnapshot,
  getTodayIsoDate,
} from "@/domains/trash-rotation/client";
import { type TrashWeekSnapshot } from "@/domains/trash-rotation/types";
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

  const handleGenerateAssignment = async () => {
    if (selectedPeople.length === 0) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const data = await createTrashAssignmentRequest(
        selectedDate,
        selectedPeople,
      );

      setFeedbackMessage(data.message ?? "Rodízio salvo com sucesso.");
      setSelectedPeople([]);

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
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <Card className="min-h-136 border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trash2 className="h-5 w-5 text-primary" />
                Rodízio do lixo
              </CardTitle>
              <CardDescription>
                Escolha uma data da semana, selecione quem pode participar e o
                sistema sorteará um responsável para o dia selecionado.
              </CardDescription>
            </div>
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

          <div className="rounded-2xl border border-primary/15 bg-background/70 p-4 shadow-inner shadow-black/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Semana armazenada
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedWeekRange}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary">
                    {assignedCount} dia(s) preenchido(s)
                  </span>
                  <span className="rounded-full border border-border bg-muted/40 px-3 py-1 font-medium text-muted-foreground">
                    {availableCount} participante(s) livre(s)
                  </span>
                  <span className="rounded-full border border-border bg-muted/30 px-3 py-1 font-medium text-muted-foreground">
                    Selecione um dia abaixo
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
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
              </div>
            </div>

            <div className="mt-4 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-3">
                {(weekSnapshot?.weekDates ?? []).map((date) => {
                  const assignment = weekSnapshot?.assignments.find(
                    (item) => item.date === date,
                  );
                  const isSelectedDay = date === selectedDate;

                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      className={[
                        "group min-w-28 rounded-2xl border px-4 py-3 text-left transition-all",
                        isSelectedDay
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : assignment
                            ? "border-primary/20 bg-primary/8 hover:border-primary/40 hover:bg-primary/12"
                            : "border-border bg-card/70 hover:border-primary/30 hover:bg-accent",
                      ].join(" ")}
                    >
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
                      <p className="mt-2 text-base font-semibold">
                        {formatMonthDay(date)}
                      </p>
                      <p
                        className={[
                          "mt-2 text-xs",
                          isSelectedDay
                            ? "text-primary-foreground/80"
                            : assignment
                              ? "text-primary"
                              : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {assignment ? assignment.assignee : "Disponível"}
                      </p>
                    </button>
                  );
                })}
              </div>
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

          {currentAssignment && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-sm">
              <p className="text-sm font-medium text-primary">
                Esta data já foi definida
              </p>
              <p className="mt-1 text-sm text-foreground">
                <span className="font-semibold">
                  {currentAssignment.assignee}
                </span>{" "}
                ficou responsável pelo lixo em{" "}
                {formatWeekDateLabel(selectedDate)}.
              </p>
            </div>
          )}

          {!currentAssignment && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                Dia selecionado: {formatWeekDateLabel(selectedDate)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha os participantes elegíveis e faça o sorteio deste dia.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Participantes elegíveis
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedPeople.length} selecionado(s) de {availableCount}{" "}
                disponível(eis)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAllEligible}>
                Todos os elegíveis
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Limpar
              </Button>
            </div>
          </div>

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
                    "rounded-xl border p-3 text-left transition-all",
                    isAssigned
                      ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-60"
                      : isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10"
                        : "border-border bg-card/80 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent text-card-foreground",
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

        <CardFooter className="pt-2">
          <Button
            onClick={handleGenerateAssignment}
            disabled={
              isLoading ||
              isSaving ||
              currentAssignment !== undefined ||
              selectedPeople.length === 0
            }
            size="lg"
            className="w-full"
          >
            <UserRoundCheck
              className={`mr-2 h-5 w-5 ${isSaving ? "animate-pulse" : ""}`}
            />
            {isSaving ? "Salvando rodízio..." : "Sortear responsável do dia"}
          </Button>
        </CardFooter>
      </Card>

      {/* <Card className="min-h-[34rem] border-primary/20 bg-primary/5 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <CalendarDays className="h-5 w-5" />
            Resumo da semana
          </CardTitle>
          <CardDescription>
            O histórico salvo em JSON local mostra o status do dia selecionado e
            quem já participou nesta semana.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading && !weekSnapshot ? (
            <div className="flex min-h-[24rem] items-center justify-center text-sm text-muted-foreground">
              Carregando semana...
            </div>
          ) : weekSnapshot ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/20 bg-card/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Dia selecionado
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatWeekDateLabel(selectedDate)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {currentAssignment
                    ? `${currentAssignment.assignee} já está responsável por este dia.`
                    : "Ainda não existe um responsável definido para este dia."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card/70 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Dias preenchidos
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {assignedCount}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card/70 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Pessoas já escaladas
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {weekSnapshot.assignedParticipants.length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Histórico da semana
                </p>
                {weekSnapshot.weekDates.map((date) => {
                  const assignment = weekSnapshot.assignments.find(
                    (item) => item.date === date,
                  );
                  const isSelectedDay = date === selectedDate;

                  return (
                    <div
                      key={date}
                      className={[
                        "rounded-xl border p-4 transition-all",
                        isSelectedDay
                          ? "border-primary bg-primary/12 shadow-sm"
                          : "border-border bg-card/70",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {formatWeekDateLabel(date)}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {assignment
                              ? assignment.assignee
                              : "Nenhuma pessoa definida ainda"}
                          </p>
                        </div>
                        <span
                          className={[
                            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                            assignment
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          ].join(" ")}
                        >
                          {assignment ? "Preenchido" : "Livre"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Já participaram nesta semana
                </p>
                <div className="flex flex-wrap gap-2">
                  {weekSnapshot.assignedParticipants.length > 0 ? (
                    weekSnapshot.assignedParticipants.map((person) => (
                      <span
                        key={person}
                        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {person}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Ainda não há ninguém registrado nesta semana.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[24rem] items-center justify-center text-sm text-muted-foreground">
              Não foi possível carregar os dados da semana.
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}
