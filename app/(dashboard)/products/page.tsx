import type { Metadata } from "next"
import { ProductsTable } from "@/components/products-table"

export const metadata: Metadata = {
  title: "Товары",
  description: "Просмотр доступных товаров от поставщиков",
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Товары</h2>
      </div>

      <div className="mt-4">
        <ProductsTable />
      </div>
    </div>
  )
}
