import { Sidebar } from '@/components/layout/Sidebar';
import { OrgSwitcher } from '@/components/layout/OrgSwitcher';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <OrgSwitcher />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
