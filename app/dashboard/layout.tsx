import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SessionProvider } from "@/components/providers/session-provider";

// Force dynamic rendering for all dashboard pages (they require auth)
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
