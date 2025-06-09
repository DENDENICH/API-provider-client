import type { Metadata } from "next"
import { DeliveryRequestsTable } from "@/components/delivery-requests-table"

export const metadata: Metadata = {
  title: "Запросы на поставку",
  description: "Управление запросами на поставку",
}

export default function DeliveryRequestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Запросы на поставку</h2>
      </div>

      <div className="mt-4">
        <DeliveryRequestsTable />
      </div>
    </div>
  )
}
