import Link from "next/link";
import { requireRole } from "@/lib/authz";
import { Topbar } from "@/components/topbar";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/ranking", label: "Ranking" },
  { href: "/admin/users", label: "Usuários" },
  { href: "/admin/activations", label: "Ativações" },
  { href: "/admin/awards", label: "Auditoria" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  return (
    <div>
      <Topbar />
      <nav className="border-b border-border bg-card/30">
        <div className="container flex gap-1 overflow-x-auto py-2 text-sm">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 hover:bg-muted/50"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="container py-6">{children}</main>
    </div>
  );
}
