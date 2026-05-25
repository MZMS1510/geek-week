"use client";

import { useMemo, useState } from "react";
import type { EventDay } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

  const byDay = useMemo(() => {
    const map = new Map<EventDay, Activation[]>();
    for (const a of activations) {
      if (!map.has(a.day)) map.set(a.day, []);
      map.get(a.day)!.push(a);
    }
    return map;
  }, [activations]);

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
                      onClick={() => setActivationId(a.id)}
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
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!activationId}>
        Dar pontos
      </Button>
    </form>
  );
}
