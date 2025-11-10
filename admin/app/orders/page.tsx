import { OrdersTable } from "@/components/orders/orders-table";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">
              Orders Management
            </h1>
          </div>
          <OrdersTable />
        </main>
      </div>
    </div>
  );
}
