import type { Metadata } from "next"
import { CreateDeliveryForm } from "@/components/create-delivery-form"

export const metadata: Metadata = {
  title: "Создание поставки",
  description: "Создание новой поставки",
}

export default function CreateDeliveryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Создание поставки</h2>
      </div>
      <CreateDeliveryForm />
    </div>
  )
}
