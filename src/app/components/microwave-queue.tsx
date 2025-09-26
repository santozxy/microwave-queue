"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shuffle, Users, Clock, Check } from "lucide-react";

const employees = [
  "Alberito",
  "Tubarão",
  "É o Jeff",
  "Fabão",
  "Negão",
  "Fabricio Bezerro",
  "Gaibriel",
  "Webson Siacalme",
  "Ramun",
  "Juno Severino",
  "Auricélia",
];

export function MicrowaveQueue() {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [queueOrder, setQueueOrder] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePersonToggle = (person: string) => {
    setSelectedPeople((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person]
    );
    setQueueOrder([]);
  };

  const generateRandomOrder = async () => {
    if (selectedPeople.length === 0) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const shuffled = [...selectedPeople].sort(() => Math.random() - 0.5);
    setQueueOrder(shuffled);
    setIsGenerating(false);
  };

  const selectAll = () => {
    setSelectedPeople(employees);
    setQueueOrder([]);
  };

  const clearAll = () => {
    setSelectedPeople([]);
    setQueueOrder([]);
  };

  return (
    <div className="h-screen bg-background p-4 flex flex-col overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col h-full w-full">
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Clock className="h-7 w-7 text-primary" />
            Fila do Microondas
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione quem vai participar e gere a ordem aleatória
          </p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0 w-full">
          <div className="w-1/2 flex-shrink-0">
            <Card className="h-full flex flex-col bg-card border-border">
              <CardHeader className="pb-4 flex-shrink-0">
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
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>

              <CardFooter className="pt-4 flex-shrink-0">
                <div className="w-full space-y-3">
                  <Button
                    onClick={generateRandomOrder}
                    disabled={selectedPeople.length === 0 || isGenerating}
                    size="lg"
                    className="w-full"
                  >
                    <Shuffle
                      className={`h-5 w-5 mr-2 ${
                        isGenerating ? "animate-spin" : ""
                      }`}
                    />
                    {isGenerating ? "Gerando..." : "Gerar Ordem Aleatória"}
                  </Button>
                  {selectedPeople.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Selecione pelo menos uma pessoa para gerar a fila
                    </p>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="w-1/2 flex-shrink-0">
            <Card className="h-full border-primary/20 bg-primary/5 flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-primary text-xl flex items-center gap-2">
                  🎯 Ordem da Fila
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {queueOrder.length > 0
                    ? `Do primeiro ao último • ${queueOrder.length} pessoas`
                    : "A fila aparecerá aqui após gerar a ordem"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 flex-1 min-h-0 flex flex-col overflow-hidden">
                {queueOrder.length > 0 ? (
                  <>
                    <div className="flex-1 overflow-y-auto pr-1">
                      <div className="grid grid-cols-2 gap-2">
                        {queueOrder.map((person, index) => (
                          <div
                            key={person}
                            className={`
                              flex items-center justify-between p-3 rounded-lg border-2 transition-all
                              ${
                                index === 0
                                  ? "bg-primary/10 border-primary shadow-sm col-span-2"
                                  : "bg-card border-border"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`
                                flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0
                                ${
                                  index === 0
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }
                              `}
                              >
                                {index + 1}
                              </div>
                              <span
                                className={`font-semibold text-sm truncate ${
                                  index === 0
                                    ? "text-primary"
                                    : "text-card-foreground"
                                }`}
                              >
                                {person}
                              </span>
                            </div>
                            {index === 0 && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                Próximo
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-primary/15 rounded-lg flex-shrink-0 border border-primary/30">
                      <p className="text-sm text-primary text-center font-medium">
                        🔥 <strong>{queueOrder[0]}</strong> é o próximo na fila!
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Clock className="h-8 w-8 text-primary/60" />
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Nenhuma fila gerada ainda
                        </p>
                        <p className="text-sm text-muted-foreground/80 mt-1">
                          Selecione os participantes e clique em &quot;Gerar
                          Ordem Aleatória&quot;
                        </p>
                      </div>
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
