import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  upsertActivationAction,
  toggleActivationAction,
  deleteActivationAction,
} from "./actions";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "FRIDAY"] as const;
const DAY_LABEL: Record<(typeof DAYS)[number], string> = {
  MONDAY: "Seg 25/05",
  TUESDAY: "Ter 26/05",
  WEDNESDAY: "Qua 27/05",
  FRIDAY: "Sex 29/05",
};

export const dynamic = "force-dynamic";

export default async function ActivationsPage() {
  const activations = await prisma.activation.findMany({
    orderBy: [{ day: "asc" }, { defaultPoints: "desc" }],
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova ativação</CardTitle>
          <CardDescription>
            Adicione uma ativação com pontuação padrão. Staff pode sobrescrever na hora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertActivationAction} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" placeholder="GameTourney — Win" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Dia</Label>
              <Select id="day" name="day" required defaultValue="MONDAY">
                {DAYS.map((d) => (
                  <option key={d} value={d}>{DAY_LABEL[d]}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPoints">Pontos padrão</Label>
              <Input id="defaultPoints" name="defaultPoints" type="number" defaultValue={20} required />
            </div>
            <div className="flex items-end gap-2 pt-1">
              <input type="hidden" name="isActive" value="on" />
              <Button type="submit" className="w-full">Adicionar</Button>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input id="description" name="description" placeholder="ex: venceu uma partida" />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ativações ({activations.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {activations.map((a) => (
            <form
              key={a.id}
              action={upsertActivationAction}
              className="grid gap-2 py-3 sm:grid-cols-12 sm:items-center"
            >
              <input type="hidden" name="id" value={a.id} />
              <Input
                name="name"
                defaultValue={a.name}
                className="sm:col-span-4"
              />
              <Select name="day" defaultValue={a.day} className="sm:col-span-2">
                {DAYS.map((d) => (
                  <option key={d} value={d}>{DAY_LABEL[d]}</option>
                ))}
              </Select>
              <Input
                name="defaultPoints"
                type="number"
                defaultValue={a.defaultPoints}
                className="sm:col-span-2"
              />
              <Input
                name="description"
                defaultValue={a.description ?? ""}
                placeholder="descrição"
                className="sm:col-span-3"
              />
              <input type="hidden" name="isActive" value={a.isActive ? "on" : ""} />
              <div className="flex items-center gap-2 sm:col-span-1 sm:justify-end">
                <Button type="submit" size="sm" variant="secondary">Salvar</Button>
              </div>
              <div className="flex items-center gap-2 sm:col-span-12 sm:justify-end">
                <Badge variant={a.isActive ? "success" : "warn"}>
                  {a.isActive ? "ativa" : "inativa"}
                </Badge>
                <ToggleButton id={a.id} />
                <DeleteButton id={a.id} />
              </div>
            </form>
          ))}
          {activations.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma ativação ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleButton({ id }: { id: string }) {
  return (
    <form action={toggleActivationAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="ghost">Ligar/Desligar</Button>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteActivationAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="destructive">Apagar</Button>
    </form>
  );
}
