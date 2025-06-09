import type { Metadata } from "next"
import DeliveriesClientPage from "./DeliveriesClientPage"

export const metadata: Metadata = {
  title: "Поставки",
  description: "Управление поставками",
}

export default function DeliveriesPage() {
  return <DeliveriesClientPage />
}
