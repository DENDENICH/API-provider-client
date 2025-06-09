"use client"

import { DeliveriesTable } from "@/components/deliveries-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function DeliveriesClientPage() {
  // Получаем пользователя из контекста аутентификации
  const { user } = useAuth()

  // Отладочный лог для проверки роли пользователя
  useEffect(() => {
    console.log("DeliveriesClientPage - User:", user)
    console.log("DeliveriesClientPage - User role:", user?.organizerRole)
  }, [user])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Поставки</h2>

        {/* Отображаем кнопку "Создать поставку" только для роли "company" */}
        {user?.organizerRole === "company" && (
          <Link href="/deliveries/create">
            <Button
              style={{
                backgroundColor: "#f97316",
                color: "white",
                borderColor: "#f97316",
              }}
              className="hover:bg-[#ea580c]"
            >
              Создать поставку
            </Button>
          </Link>
        )}
      </div>
      <DeliveriesTable />
    </div>
  )
}
