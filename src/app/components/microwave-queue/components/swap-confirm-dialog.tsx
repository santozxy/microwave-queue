"use client";

import { ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { type SwapConfirm } from "./types";

interface SwapConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  swapConfirm: SwapConfirm | null;
  swapFromName: string;
  swapToName: string;
}

export function SwapConfirmDialog({
  onCancel,
  onConfirm,
  swapConfirm,
  swapFromName,
  swapToName,
}: SwapConfirmDialogProps) {
  return (
    <Dialog
      open={swapConfirm !== null}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
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
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Confirmar troca
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
