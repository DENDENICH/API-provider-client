"use client"
import { SuppliersTable } from "@/components/suppliers-table"
import { AddSupplierForm } from "@/components/add-supplier-form"
import { useState } from "react"

export default function SuppliersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSupplierAdded = () => {
    // Увеличиваем счетчик для триггера обновления таблицы
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Поставщики</h2>
      </div>

      <AddSupplierForm onSupplierAdded={handleSupplierAdded} />

      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4">Список поставщиков</h3>
        <SuppliersTable refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
