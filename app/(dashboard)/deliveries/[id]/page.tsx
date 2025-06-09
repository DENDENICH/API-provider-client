"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, MapPin } from "lucide-react"
import type { SupplyResponse } from "@/lib/api-types"

// Функция для отображения статуса поставки
function getStatusBadge(status: SupplyResponse["status"]) {
  switch (status) {
    case "in_processing":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          В обработке
        </Badge>
      )
    case "assembled":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Собран
        </Badge>
      )
    case "in_delivery":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          В доставке
        </Badge>
      )
    case "delivered":
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          Доставлен
        </Badge>
      )
    case "adopted":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Принят
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          Отменен
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          {status || "Неизвестно"}
        </Badge>
      )
  }
}

// Функция для получения названия категории товара
function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    hair_coloring: "Окрашивание волос",
    hair_care: "Уход за волосами",
    hair_styling: "Укладка волос",
    consumables: "Расходные материалы",
    perming: "Химическая завивка",
    eyebrows: "Брови",
    manicure_and_pedicure: "Маникюр и педикюр",
    tools_and_equipment: "Инструменты и оборудование",
  }
  return categoryMap[category] || category
}

interface DeliveryDetailPageProps {
  params: Promise<{ id: string }>
}

export default function DeliveryDetailPage({ params }: DeliveryDetailPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [delivery, setDelivery] = useState<SupplyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Проверяем, не является ли текущий маршрут /deliveries/create
    if (resolvedParams.id === "create") {
      router.push("/deliveries/create")
      return
    }

    const loadDeliveryData = () => {
      try {
        setIsLoading(true)
        setError(null)

        // Получаем данные поставки из localStorage
        const deliveryData = localStorage.getItem(`delivery_${resolvedParams.id}`)

        if (!deliveryData) {
          setError("Данные поставки не найдены")
          return
        }

        const parsedDelivery = JSON.parse(deliveryData) as SupplyResponse
        setDelivery(parsedDelivery)
      } catch (err) {
        console.error("Error loading delivery data:", err)
        setError("Ошибка при загрузке данных поставки")
      } finally {
        setIsLoading(false)
      }
    }

    loadDeliveryData()
  }, [resolvedParams.id, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="text-lg font-medium">Загрузка данных поставки...</div>
            <div className="text-sm text-muted-foreground mt-2">Пожалуйста, подождите</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="text-lg font-medium text-red-600">Ошибка</div>
            <div className="text-sm text-muted-foreground mt-2">{error || "Поставка не найдена"}</div>
            <Button onClick={() => router.push("/deliveries")} className="mt-4">
              Вернуться к списку поставок
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Заголовок с кнопкой возврата */}
      <div className="flex items-center gap-4">
        {/* <Button variant="outline" size="sm" onClick={() => router.push("/deliveries")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к поставкам
        </Button> */}
        <div>
          <h1 className="text-2xl font-bold">Поставка #{delivery.article}</h1>
          <p className="text-muted-foreground">Детальная информация о поставке</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Основная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Статус:</span>
              {getStatusBadge(delivery.status)}
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm font-medium">Поставщик:</span>
              <span className="text-sm">{delivery.supplier.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Компания:</span>
              <span className="text-sm">{delivery.company.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Общая сумма:</span>
              <span className="text-sm font-medium">{delivery.total_price.toFixed(2)} ₽</span>
            </div>
          </CardContent>
        </Card>

        {/* Адрес доставки */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Адрес доставки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{delivery.delivery_address}</p>
          </CardContent>
        </Card>
      </div>

      {/* Товары в поставке */}
      <Card>
        <CardHeader>
          <CardTitle>Товары в поставке</CardTitle>
          <CardDescription>Список товаров и их количество</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {delivery.supply_products.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">Артикул: {item.product.article}</p>
                  <p className="text-sm text-muted-foreground">Категория: {getCategoryName(item.product.category)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.quantity} шт.</p>
                  <p className="text-sm text-muted-foreground">{item.product.price.toFixed(2)} ₽ за шт.</p>
                  <p className="text-sm font-medium">Итого: {(item.product.price * item.quantity).toFixed(2)} ₽</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
