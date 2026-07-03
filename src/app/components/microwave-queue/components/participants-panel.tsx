"use client";

import { Check, Shuffle, Users } from "lucide-react";

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
  isGenerating: boolean;
  onClearAll: () => void;
  onGenerateRandomOrder: () => void;
  onPersonToggle: (person: string) => void;
  onSelectAll: () => void;
  selectedPeople: string[];
}

export function ParticipantsPanel({
  isGenerating,
  onClearAll,
  onGenerateRandomOrder,
  onPersonToggle,
  onSelectAll,
  selectedPeople,
}: ParticipantsPanelProps) {
  return (
    <Card className="min-h-136 border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Participantes</CardTitle>
            </div>
            <CardDescription>
              {selectedPeople.length} de {employees.length} selecionados
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Todos
            </Button>
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {employees.map((person) => {
            const isSelected = selectedPeople.includes(person);

            return (
              <button
                key={person}
                type="button"
                onClick={() => onPersonToggle(person)}
                className={[
                  "rounded-lg border-2 p-3 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent text-card-foreground",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <EmployeeAvatar
                      name={person}
                      className={isSelected ? "border-primary/40" : ""}
                    />
                    <span className="truncate text-sm font-semibold">
                      {person}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full space-y-3">
          <Button
            onClick={onGenerateRandomOrder}
            disabled={selectedPeople.length === 0 || isGenerating}
            size="lg"
            className="w-full"
          >
            <Shuffle
              className={`mr-2 h-5 w-5 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "Gerando..." : "Gerar ordem aleatória"}
          </Button>

          {selectedPeople.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">
              Selecione pelo menos uma pessoa para gerar a fila
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
