import { requireRole } from "@/lib/authz";
import { Topbar } from "@/components/topbar";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STAFF");
  return (
    <div>
      <Topbar />
      <main className="container py-6">{children}</main>
    </div>
  );
}
