import type { Metadata } from "next"
import { ExpenseTable } from "@/components/expense-table"

export const metadata: Metadata = {
  title: "Склад",
  description: "Управление товарами на складе",
}

export default function ExpensePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Склад</h2>
      </div>

      <div className="mt-4">
        <ExpenseTable />
      </div>
    </div>
  )
}
