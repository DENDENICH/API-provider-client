import type { Metadata } from "next"
import EmployeesClientPage from "./EmployeesClientPage"

export const metadata: Metadata = {
  title: "Сотрудники",
  description: "Управление сотрудниками организации",
}

export default function EmployeesPage() {
  return <EmployeesClientPage />
}
