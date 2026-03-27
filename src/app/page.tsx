import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GarbageDay } from "./components/garbage-day";
import { HistoryTab } from "./components/history-tab";
import { MicrowaveQueue } from "./components/microwave-queue";

const employees = [
  "Catatau",
  "Mão de obra quase barata",
  "É o Jeff",
  "Fabão",
  "Negão",
  "Pacote Office 365",
  "QA Cachaça",
  "Webson Siacalme",
  "Raman",
  "Juno Severino",
  "Auricélia",
  "FormiguinhaZ",
  "Matheus Escobar",
  "Alysson",
  "Sereio",
  "Fabinha",
];

export default function Page() {
  return (
    <main className="h-screen overflow-hidden p-4 bg-background">
      <div className="max-w-6xl mx-auto h-full">
        <Tabs defaultValue="fila-almoco" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fila-almoco">Fila do almoco</TabsTrigger>
            <TabsTrigger value="dia-do-lixo">Dia do lixo</TabsTrigger>
            <TabsTrigger value="historico">Historico</TabsTrigger>
          </TabsList>

          <TabsContent value="fila-almoco" className="h-[calc(100%-3rem)]">
            <MicrowaveQueue employees={employees} />
          </TabsContent>

          <TabsContent value="dia-do-lixo" className="h-[calc(100%-3rem)]">
            <GarbageDay employees={employees} />
          </TabsContent>

          <TabsContent value="historico" className="h-[calc(100%-3rem)]">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
