import type { Metadata } from "next"
import { CreateProductForm } from "@/components/create-product-form"

export const metadata: Metadata = {
  title: "Добавление товара",
  description: "Добавление нового товара",
}

export default function CreateProductPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Добавление товара</h2>
      </div>
      <CreateProductForm />
    </div>
  )
}
