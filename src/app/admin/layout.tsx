import { Suspense, type ReactNode } from "react";
import { CurrentUserProvider } from "@/lib/auth/current-user-context";
import { ConfirmProvider } from "@/lib/hooks/use-confirm";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <CurrentUserProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-background">
          <AdminSidebar />
          <div className="flex min-h-screen flex-col lg:pl-64">
            <AdminTopbar />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-7xl space-y-6">
                <Suspense>{children}</Suspense>
              </div>
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </CurrentUserProvider>
  );
}
