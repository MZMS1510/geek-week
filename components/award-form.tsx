"use client";

import { useMemo, useState } from "react";
import type { EventDay } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DAY_LABEL: Record<EventDay, string> = {
  MONDAY: "Seg",
  TUESDAY: "Ter",
  WEDNESDAY: "Qua",
  FRIDAY: "Sex",
};

type Activation = {
  id: string;
  name: string;
  day: EventDay;
  defaultPoints: number;
};

export function AwardForm({
  token,
  activations,
  action,
}: {
  token: string;
  activations: Activation[];
  action: (formData: FormData) => void;
}) {
  const [activationId, setActivationId] = useState<string>("");
  const [points, setPoints] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const byDay = useMemo(() => {
    const map = new Map<EventDay, Activation[]>();
    for (const a of activations) {
      if (!map.has(a.day)) map.set(a.day, []);
      map.get(a.day)!.push(a);
    }
    return map;
  }, [activations]);

  const selected = activations.find((a) => a.id === activationId);

  const onPickActivation = (id: string) => {
    setActivationId(id);
    const a = activations.find((x) => x.id === id);
    if (a) setPoints(String(a.defaultPoints));
  };

  const customPoints =
    selected != null && points !== "" && Number(points) !== selected.defaultPoints;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="activationId" value={activationId} />

      <div className="space-y-2">
        <Label>Ativação</Label>
        <div className="space-y-3">
          {(["MONDAY", "TUESDAY", "WEDNESDAY", "FRIDAY"] as EventDay[]).map((day) => {
            const items = byDay.get(day) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={day}>
                <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {DAY_LABEL[day]}
                </div>
                <div className="grid gap-2">
                  {items.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onPickActivation(a.id)}
                      className={
                        "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm " +
                        (activationId === a.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:bg-muted/40")
                      }
                    >
                      <span className="truncate">{a.name}</span>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                        +{a.defaultPoints}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {activationId && (
          <button
            type="button"
            onClick={() => {
              setActivationId("");
              setPoints("");
            }}
            className="text-xs text-muted-foreground underline"
          >
            Limpar seleção (pontos avulsos)
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="points">
          Pontos {customPoints && <span className="text-amber-400">(sobrescrito)</span>}
        </Label>
        <Input
          id="points"
          name="points"
          type="number"
          inputMode="numeric"
          placeholder="ex: 50"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Observação (opcional)</Label>
        <Textarea
          id="note"
          name="note"
          placeholder="ex: venceu jogo de luta no estande X"
          value={note}
          maxLength={280}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="w-full">
        Dar pontos
      </Button>
    </form>
  );
}
