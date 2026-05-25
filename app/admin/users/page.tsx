import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setUserRoleAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await requireRole("ADMIN");
  const q = (searchParams.q ?? "").trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      qrToken: true,
      receivedAwards: { select: { points: true } },
    },
    take: 200,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex gap-2">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome ou email"
          />
          <Button type="submit" variant="secondary">Buscar</Button>
        </form>

        <div className="divide-y divide-border">
          {users.map((u) => {
            const score = u.receivedAwards.reduce((s, a) => s + a.points, 0);
            const isSelf = u.id === session.user.id;
            return (
              <div key={u.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{u.name ?? u.email}</span>
                    {isSelf && <Badge variant="outline">você</Badge>}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {u.email} · QR <code>{u.qrToken}</code> · {score} pts
                  </div>
                </div>
                <form action={setUserRoleAction} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={u.id} />
                  <Select name="role" defaultValue={u.role} className="h-9 w-36">
                    <option value="PARTICIPANT">PARTICIPANT</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </Select>
                  <Button type="submit" size="sm" variant="secondary">Salvar</Button>
                </form>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum usuário.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
