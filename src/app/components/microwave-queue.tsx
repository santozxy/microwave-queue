"use client";

import {
  ArrowLeftRight,
  Check,
  Clock,
  GripVertical,
  Shuffle,
  Trash2,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { employees } from "@/lib/employees";

import { TrashRotation } from "./trash-rotation";

interface QueueItem {
  name: string;
  previousPosition: number | null;
}

interface SwapConfirm {
  fromIndex: number;
  toIndex: number;
}

export function MicrowaveQueueModule() {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [queueOrder, setQueueOrder] = useState<QueueItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [swapConfirm, setSwapConfirm] = useState<SwapConfirm | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const handlePersonToggle = (person: string) => {
    setSelectedPeople((currentSelection) =>
      currentSelection.includes(person)
        ? currentSelection.filter((item) => item !== person)
        : [...currentSelection, person],
    );
    setQueueOrder([]);
  };

  const generateRandomOrder = async () => {
    if (selectedPeople.length === 0) {
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const shuffled = [...selectedPeople].sort(() => Math.random() - 0.5);
    setQueueOrder(
      shuffled.map((name) => ({ name, previousPosition: null })),
    );
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

  const handleDragStart = (event: React.DragEvent, index: number) => {
    dragIndexRef.current = index;
    setDraggingIndex(index);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dragIndexRef.current !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (event: React.DragEvent, toIndex: number) => {
    event.preventDefault();
    const fromIndex = dragIndexRef.current;

    setDragOverIndex(null);
    setDraggingIndex(null);

    if (fromIndex === null || fromIndex === toIndex) {
      return;
    }

    setSwapConfirm({ fromIndex, toIndex });
    dragIndexRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragIndexRef.current = null;
  };

  const confirmSwap = () => {
    if (!swapConfirm) {
      return;
    }

    const { fromIndex, toIndex } = swapConfirm;

    setQueueOrder((currentQueue) => {
      const updatedQueue = [...currentQueue];
      const fromItem = {
        ...updatedQueue[fromIndex],
        previousPosition: fromIndex + 1,
      };
      const toItem = {
        ...updatedQueue[toIndex],
        previousPosition: toIndex + 1,
      };

      updatedQueue[fromIndex] = toItem;
      updatedQueue[toIndex] = fromItem;

      return updatedQueue;
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
    <>
      <div className="grid gap-6 xl:grid-cols-2">
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
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Todos
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
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
                    onClick={() => handlePersonToggle(person)}
                    className={[
                      "rounded-lg border-2 p-3 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent text-card-foreground",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2 text-sm font-semibold">
                        {person}
                      </span>
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
                onClick={generateRandomOrder}
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
                    onDragStart={(event) => handleDragStart(event, index)}
                    onDragOver={(event) => handleDragOver(event, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(event) => handleDrop(event, index)}
                    onDragEnd={handleDragEnd}
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
      </div>

      <Dialog
        open={swapConfirm !== null}
        onOpenChange={(isOpen) => !isOpen && cancelSwap()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              Confirmar troca de posição
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
                <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-bold text-primary">
                  {swapConfirm.fromIndex + 1}
                </div>
                <p className="max-w-25 line-clamp-2 text-center text-sm font-medium text-foreground">
                  {swapFromName}
                </p>
              </div>

              <ArrowLeftRight className="h-6 w-6 shrink-0 text-muted-foreground" />

              <div className="text-center">
                <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-bold text-primary">
                  {swapConfirm.toIndex + 1}
                </div>
                <p className="max-w-25 line-clamp-2 text-center text-sm font-medium text-foreground">
                  {swapToName}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-row gap-2">
            <Button variant="outline" onClick={cancelSwap}>
              Cancelar
            </Button>
            <Button onClick={confirmSwap}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Confirmar troca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


