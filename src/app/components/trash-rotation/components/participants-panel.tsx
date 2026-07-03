"use client";

import { Check, Trash2, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmployeeAvatar } from "@/app/components/employee-avatar";
import { employees } from "@/lib/employees";

interface ParticipantsPanelProps {
  availableCount: number;
  currentAssignmentExists: boolean;
  errorMessage: string | null;
  feedbackMessage: string | null;
  isAssigned: (person: string) => boolean;
  isLoading: boolean;
  isRemoving: boolean;
  isSaving: boolean;
  isSelected: (person: string) => boolean;
  onClearSelection: () => void;
  onGenerateAssignment: () => void;
  onSelectAllEligible: () => void;
  onTogglePerson: (person: string) => void;
  selectedPeopleCount: number;
}

export function ParticipantsPanel({
  availableCount,
  currentAssignmentExists,
  errorMessage,
  feedbackMessage,
  isAssigned,
  isLoading,
  isRemoving,
  isSaving,
  isSelected,
  onClearSelection,
  onGenerateAssignment,
  onSelectAllEligible,
  onTogglePerson,
  selectedPeopleCount,
}: ParticipantsPanelProps) {
  return (
    <Card className="min-h-136 border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Participantes</CardTitle>
            </div>
            <CardDescription>
              {selectedPeopleCount} de {availableCount} selecionados
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAllEligible}>
              Todos
            </Button>
            <Button variant="outline" size="sm" onClick={onClearSelection}>
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
            const assigned = isAssigned(person);
            const selected = isSelected(person);

            return (
              <button
                key={person}
                type="button"
                onClick={() => onTogglePerson(person)}
                disabled={assigned}
                className={[
                  "rounded-lg border-2 p-3 text-left transition-all",
                  assigned
                    ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-60"
                    : selected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card hover:border-primary/50 hover:bg-accent text-card-foreground",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <EmployeeAvatar
                      name={person}
                      className={selected ? "border-primary/40" : ""}
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {person}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {assigned
                          ? "Indisponível nesta semana"
                          : selected
                            ? "Selecionado para o sorteio"
                            : "Disponível para participar"}
                      </span>
                    </div>
                  </div>
                  {assigned ? (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                      Já saiu
                    </span>
                  ) : selected ? (
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
            onClick={onGenerateAssignment}
            disabled={
              isLoading ||
              isSaving ||
              isRemoving ||
              currentAssignmentExists ||
              selectedPeopleCount === 0
            }
            size="lg"
            className="w-full"
          >
            <UserRoundCheck
              className={`mr-2 h-5 w-5 ${isSaving ? "animate-spin" : ""}`}
            />
            {isSaving ? "Salvando rodízio..." : "Sortear responsável do dia"}
          </Button>

          {selectedPeopleCount === 0 && !currentAssignmentExists && (
            <p className="text-center text-xs text-muted-foreground">
              Selecione pelo menos uma pessoa para sortear o responsável
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
