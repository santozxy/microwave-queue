"use client";

import { Clock, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { employees } from "@/lib/employees";

import { TrashRotation } from "../trash-rotation";
import { OrderPanel } from "./components/order-panel";
import { ParticipantsPanel } from "./components/participants-panel";
import { SwapConfirmDialog } from "./components/swap-confirm-dialog";
import { type QueueItem, type SwapConfirm } from "./components/types";

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
        <ParticipantsPanel
          isGenerating={isGenerating}
          onClearAll={clearAll}
          onGenerateRandomOrder={generateRandomOrder}
          onPersonToggle={handlePersonToggle}
          onSelectAll={selectAll}
          selectedPeople={selectedPeople}
        />

        <OrderPanel
          dragOverIndex={dragOverIndex}
          draggingIndex={draggingIndex}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          queueOrder={queueOrder}
        />
      </div>

      <SwapConfirmDialog
        onCancel={cancelSwap}
        onConfirm={confirmSwap}
        swapConfirm={swapConfirm}
        swapFromName={swapFromName}
        swapToName={swapToName}
      />
    </>
  );
}

export function MicrowaveQueue() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="text-center">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
            <Clock className="h-7 w-7 text-primary" />
            Escalas do escritório
          </h1>
          <p className="mt-2 text-muted-foreground">
            Organize a fila do micro-ondas e o rodízio diário do lixo no mesmo
            lugar.
          </p>
        </div>

        <Tabs defaultValue="microwave" className="gap-4">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger
              value="microwave"
              className="h-10 border border-border bg-card px-4 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <Clock className="h-4 w-4" />
              Fila do micro-ondas
            </TabsTrigger>
            <TabsTrigger
              value="trash"
              className="h-10 border border-border bg-card px-4 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <Trash2 className="h-4 w-4" />
              Rodízio do lixo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="microwave">
            <MicrowaveQueueModule />
          </TabsContent>

          <TabsContent value="trash">
            <TrashRotation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
