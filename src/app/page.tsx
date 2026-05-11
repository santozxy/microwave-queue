import { Clock, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrashRotation } from "./components/trash-rotation";
import { MicrowaveQueueModule } from "./components/microwave-queue";

export default function Page() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="text-center">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
            <Clock className="h-7 w-7 text-primary" />
            Fila do micro-ondas e rodízio do lixo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Organize a fila do micro-ondas e o rodízio diário do lixo no mesmo
            lugar.
          </p>
        </div>
        <Tabs defaultValue="microwave">
          <TabsList className="">
            <TabsTrigger value="microwave">
              <Clock className="h-4 w-4" />
              Fila do micro-ondas
            </TabsTrigger>
            <TabsTrigger value="trash">
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
