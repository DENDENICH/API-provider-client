"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { suppliesService } from "@/lib/api-services"
import { useAuth } from "@/contexts/auth-context"
import type { SuppliesResponse } from "@/lib/api-types"

// Тип для отдельной поставки
type Supply = SuppliesResponse["supplies"][0]

// Функция для получения отображаемого названия статуса
function getStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    in_processing: "В обработке",
    assembled: "Собран",
    in_delivery: "В доставке",
    delivered: "Доставлен",
    adopted: "Принят",
    cancelled: "Отменен",
  }
  return statusMap[status] || status
}

// Функция для получения Badge с правильным цветом
function getStatusBadge(status: string) {
  const statusConfig: Record<string, { className: string }> = {
    in_processing: { className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    assembled: { className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    in_delivery: { className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
    delivered: { className: "bg-green-100 text-green-800 hover:bg-green-100" },
    adopted: { className: "bg-green-100 text-green-800 hover:bg-green-100" },
    cancelled: { className: "bg-red-100 text-red-800 hover:bg-red-100" },
  }

  const config = statusConfig[status] || { className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }

  return (
    <Badge variant="outline" className={`ml-2 ${config.className}`}>
      {getStatusDisplayName(status)}
    </Badge>
  )
}

// Функция для получения инициалов из названия организации
function getInitials(name?: string): string {
  if (!name) return "??"

  return (
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  )
}

// Функция для получения имени организации в зависимости от роли пользователя
function getOrganizationName(supply: Supply, userRole?: string): string {
  if (userRole === "company") {
    // Если пользователь - компания, показываем имя поставщика
    return supply.supplier?.name || "Неизвестный поставщик"
  } else if (userRole === "supplier") {
    // Если пользователь - поставщик, показываем имя компании
    return supply.company?.name || "Неизвестная компания"
  }

  // Fallback - показываем и поставщика и компанию
  return supply.supplier?.name || supply.company?.name || "Неизвестно"
}

export function RecentDeliveries() {
  const { user } = useAuth()
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentSupplies = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching recent supplies with limit 5...")
        const response = await suppliesService.getSupplies(undefined, 5)
        console.log("Received supplies response:", response)
        console.log("Number of supplies received:", response.supplies?.length || 0)

        setSupplies(response.supplies || [])
      } catch (err: any) {
        console.error("Error loading recent supplies:", err)

        // Проверяем на ошибку 404
        if (err.status === 404 || err.code === "NOT_FOUND") {
          setError("not_found")
        } else {
          setError("general")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecentSupplies()
  }, [])

  console.log("Current supplies state:", supplies)
  console.log("Number of supplies to render:", supplies.length)

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center animate-pulse">
            <div className="h-9 w-9 bg-gray-200 rounded-full" />
            <div className="ml-4 space-y-1 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="ml-auto">
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error === "not_found") {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Пока нет ни одной поставки</p>
      </div>
    )
  }

  if (error === "general") {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Ошибка загрузки поставок</p>
      </div>
    )
  }

  if (supplies.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Пока нет ни одной поставки</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {supplies.map((supply, index) => {
        const organizationName = getOrganizationName(supply, user?.organizerRole)

        console.log(`Rendering supply ${index + 1}:`, {
          id: supply.id,
          organizationName,
          status: supply.status,
        })

        return (
          <div key={supply.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
              <AvatarFallback>{getInitials(organizationName)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{organizationName}</p>
              <p className="text-sm text-muted-foreground">Поставка #{supply.id}</p>
            </div>
            <div className="ml-auto font-medium">{getStatusBadge(supply.status)}</div>
          </div>
        )
      })}
    </div>
  )
}
