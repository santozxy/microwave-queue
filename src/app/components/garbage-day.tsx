"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { logHistoryEvent } from "@/lib/history";
import { Check, RotateCw, Trash2, Users } from "lucide-react";
import { useState } from "react";

interface GarbageDayProps {
  employees: string[];
}

export function GarbageDay({ employees }: GarbageDayProps) {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const handlePersonToggle = (person: string) => {
    const isSelected = selectedPeople.includes(person);
    setSelectedPeople((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person],
    );

    void logHistoryEvent({
      module: "dia-do-lixo",
      action: isSelected ? "Participante removido" : "Participante adicionado",
      details: person,
    });

    if (winner === person) {
      setWinner(null);
    }
  };

  const selectAll = () => {
    setSelectedPeople(employees);
    setWinner(null);
    void logHistoryEvent({
      module: "dia-do-lixo",
      action: "Selecionou todos",
      details: `${employees.length} participante(s)`,
    });
  };

  const clearAll = () => {
    setSelectedPeople([]);
    setWinner(null);
    void logHistoryEvent({
      module: "dia-do-lixo",
      action: "Limpou selecao",
    });
  };

  const spinRoulette = async () => {
    if (selectedPeople.length === 0) return;

    setIsSpinning(true);
    void logHistoryEvent({
      module: "dia-do-lixo",
      action: "Roleta iniciada",
      details: `${selectedPeople.length} participante(s)`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const randomIndex = Math.floor(Math.random() * selectedPeople.length);
    const chosenPerson = selectedPeople[randomIndex];
    setWinner(chosenPerson);
    setIsSpinning(false);
    void logHistoryEvent({
      module: "dia-do-lixo",
      action: "Roleta finalizada",
      details: chosenPerson,
    });
  };

  return (
    <div className="h-full bg-background p-4 flex flex-col overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col h-full w-full">
        <div className="text-center mb-6 shrink-0">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Trash2 className="h-7 w-7 text-primary" />
            Dia do Lixo
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione os participantes e rode a roleta para definir quem leva o
            lixo hoje
          </p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0 w-full">
          <div className="w-1/2 shrink-0">
            <Card className="h-full flex flex-col bg-card border-border">
              <CardHeader className="pb-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl text-card-foreground">
                      Participantes
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Limpar
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {selectedPeople.length} de {employees.length} selecionados
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pt-0 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {employees.map((person) => {
                    const isSelected = selectedPeople.includes(person);
                    return (
                      <button
                        key={person}
                        onClick={() => handlePersonToggle(person)}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer
                          ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border bg-card hover:border-primary/50 hover:bg-accent text-card-foreground"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold truncate pr-2">
                            {person}
                          </span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>

              <CardFooter className="pt-4 shrink">
                <div className="w-full space-y-3">
                  <Button
                    onClick={spinRoulette}
                    disabled={selectedPeople.length === 0 || isSpinning}
                    size="lg"
                    className="w-full"
                  >
                    <RotateCw
                      className={`h-5 w-5 mr-2 ${isSpinning ? "animate-spin" : ""}`}
                    />
                    {isSpinning ? "Girando..." : "Rodar Roleta"}
                  </Button>
                  {selectedPeople.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Selecione pelo menos uma pessoa para rodar a roleta
                    </p>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="w-1/2 shrink">
            <Card className="h-full border-primary/20 bg-primary/5 flex flex-col">
              <CardHeader className="pb-2 shrink">
                <CardTitle className="text-primary text-xl flex items-center gap-2">
                  Resultado da Roleta
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {winner
                    ? "Pessoa sorteada para levar o lixo hoje"
                    : "O resultado aparecerá aqui após rodar a roleta"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 flex-1 flex items-center justify-center">
                {winner ? (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl">
                      🗑️
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Responsavel de hoje
                      </p>
                      <p className="text-3xl font-bold text-primary mt-1">
                        {winner}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Trash2 className="h-8 w-8 text-primary/60" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Nenhum sorteio realizado ainda
                      </p>
                      <p className="text-sm text-muted-foreground/80 mt-1">
                        Clique em &quot;Rodar Roleta&quot; para definir quem
                        leva o lixo hoje
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
