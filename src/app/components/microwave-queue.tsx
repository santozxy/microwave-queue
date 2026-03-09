"use client";

import { useState, useRef } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shuffle,
  Users,
  Clock,
  Check,
  GripVertical,
  ArrowLeftRight,
} from "lucide-react";

const employees = [
  "Catatau",
  "Mão de obra super barata",
  "É o Jeff",
  "Fabão",
  "Negão",
  "Pacote Office 365",
  "O Testador",
  "Webson Siacalme",
  "Raman",
  "Juno Severino",
  "Auricélia",
  "Jaelma",
  "Matheus Escobar",
  "Alysson",
  "Sereio",
  "Fabinha",
];

interface QueueItem {
  name: string;
  previousPosition: number | null;
}

interface SwapConfirm {
  fromIndex: number;
  toIndex: number;
}

export function MicrowaveQueue() {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [queueOrder, setQueueOrder] = useState<QueueItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [swapConfirm, setSwapConfirm] = useState<SwapConfirm | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const handlePersonToggle = (person: string) => {
    setSelectedPeople((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person],
    );
    setQueueOrder([]);
  };

  const generateRandomOrder = async () => {
    if (selectedPeople.length === 0) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const shuffled = [...selectedPeople].sort(() => Math.random() - 0.5);
    setQueueOrder(shuffled.map((name) => ({ name, previousPosition: null })));
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

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndexRef.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndexRef.current !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    setDragOverIndex(null);
    setDraggingIndex(null);
    if (fromIndex === null || fromIndex === toIndex) return;
    setSwapConfirm({ fromIndex, toIndex });
    dragIndexRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragIndexRef.current = null;
  };

  const confirmSwap = () => {
    if (!swapConfirm) return;
    const { fromIndex, toIndex } = swapConfirm;
    setQueueOrder((prev) => {
      const updated = [...prev];
      const fromItem = {
        ...updated[fromIndex],
        previousPosition: fromIndex + 1,
      };
      const toItem = { ...updated[toIndex], previousPosition: toIndex + 1 };
      updated[fromIndex] = toItem;
      updated[toIndex] = fromItem;
      return updated;
    });
    setSwapConfirm(null);
  };

  const cancelSwap = () => {
    setSwapConfirm(null);
    dragIndexRef.current = null;
  };

  const swapFromName =
    swapConfirm !== null ? queueOrder[swapConfirm.fromIndex]?.name : "";
  const swapToName =
    swapConfirm !== null ? queueOrder[swapConfirm.toIndex]?.name : "";

  return (
    <div className="h-screen bg-background p-4 flex flex-col overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col h-full w-full">
        <div className="text-center mb-6 shrink-0">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Clock className="h-7 w-7 text-primary" />
            Fila do Microondas
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione quem vai participar e gere a ordem aleatória
          </p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0 w-full">
          {/* Participantes */}
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
                    onClick={generateRandomOrder}
                    disabled={selectedPeople.length === 0 || isGenerating}
                    size="lg"
                    className="w-full"
                  >
                    <Shuffle
                      className={`h-5 w-5 mr-2 ${isGenerating ? "animate-spin" : ""}`}
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

          {/* Fila */}
          <div className="w-1/2 shrink">
            <Card className="h-full border-primary/20 bg-primary/5 flex flex-col">
              <CardHeader className="pb-2 shrink">
                <CardTitle className="text-primary text-xl flex items-center gap-2">
                  🎯 Ordem da Fila
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {queueOrder.length > 0
                    ? `Do primeiro ao último • ${queueOrder.length} pessoas • Arraste para trocar posições`
                    : "A fila aparecerá aqui após gerar a ordem"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 flex-1 min-h-0 flex flex-col overflow-hidden">
                {queueOrder.length > 0 ? (
                  <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-2">
                      {queueOrder.map((item, index) => (
                        <div
                          key={item.name}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`
                            flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing select-none
                            ${index === 0 ? "col-span-2" : ""}
                            ${
                              draggingIndex === index
                                ? "opacity-40 scale-95"
                                : dragOverIndex === index
                                  ? "border-primary bg-primary/20 scale-105 shadow-lg"
                                  : index === 0
                                    ? "bg-primary/10 border-primary shadow-sm"
                                    : "bg-card border-border hover:border-primary/40"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div
                              className={`
                              flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0
                              ${
                                index === 0
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }
                            `}
                            >
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span
                                className={`font-semibold text-sm truncate block ${
                                  index === 0
                                    ? "text-primary"
                                    : "text-card-foreground"
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.previousPosition !== null && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <ArrowLeftRight className="h-3 w-3" />
                                  Antes: {item.previousPosition}º
                                </span>
                              )}
                            </div>
                          </div>
                          {index === 0 && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium shrink-0 ml-2">
                              Próximo
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
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

      {/* Dialog de confirmação de troca */}
      <Dialog
        open={swapConfirm !== null}
        onOpenChange={(open) => !open && cancelSwap()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              Confirmar Troca de Posição
            </DialogTitle>
            <DialogDescription className="pt-2">
              Você deseja realmente trocar as posições de{" "}
              <span className="font-semibold text-foreground">
                {swapConfirm !== null ? swapConfirm.fromIndex + 1 : ""}º{" "}
                {swapFromName}
              </span>{" "}
              e{" "}
              <span className="font-semibold text-foreground">
                {swapConfirm !== null ? swapConfirm.toIndex + 1 : ""}º{" "}
                {swapToName}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          {swapConfirm !== null && (
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center font-bold text-primary text-sm mx-auto mb-1">
                  {swapConfirm.fromIndex + 1}
                </div>
                <p className="text-sm font-medium text-foreground max-w-25 text-center line-clamp-2">
                  {swapFromName}
                </p>
              </div>
              <ArrowLeftRight className="h-6 w-6 text-muted-foreground shrink-0" />
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center font-bold text-primary text-sm mx-auto mb-1">
                  {swapConfirm.toIndex + 1}
                </div>
                <p className="text-sm font-medium text-foreground max-w-25 text-center line-clamp-2">
                  {swapToName}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex flex-row">
            <Button variant="outline" onClick={cancelSwap}>
              Cancelar
            </Button>
            <Button onClick={confirmSwap}>
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Confirmar Troca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
