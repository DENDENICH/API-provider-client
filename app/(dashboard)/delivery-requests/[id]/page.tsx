"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, ArrowLeft } from "lucide-react"
import { useState } from "react"

// Типы данных для товара в запросе на поставку
// TODO: Обновить типы в соответствии с API бэкенда
type DeliveryRequestProduct = {
  id: string
  name: string
  quantity: number
  price: string
}

// Типы данных для запроса на поставку
// TODO: Обновить типы в соответствии с API бэкенда
type DeliveryRequest = {
  id: string
  number: string
  customer: string
  requestDate: string
  products: DeliveryRequestProduct[]
  status: "pending" | "accepted" | "rejected"
  address: string
  amount: string
  contactPerson: string
  contactPhone: string
  notes?: string
}

// Функция для отображения статуса запроса
function getStatusBadge(status: DeliveryRequest["status"]) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Ожидает
        </Badge>
      )
    case "accepted":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Принят
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          Отклонен
        </Badge>
      )
    default:
      return null
  }
}

export default function DeliveryRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  // Состояние для хранения данных о запросе на поставку
  // TODO: Заменить на получение данных с сервера через useEffect
  const [request, setRequest] = useState<DeliveryRequest>({
    id: params.id,
    number: `REQ-${params.id.padStart(5, "0")}`,
    customer: "Салон красоты 'Элегант'",
    requestDate: "2023-05-01",
    products: [
      {
        id: "1",
        name: "Шампунь для окрашенных волос",
        quantity: 10,
        price: "1200.00 ₽",
      },
      {
        id: "2",
        name: "Маска для волос",
        quantity: 5,
        price: "1800.50 ₽",
      },
      {
        id: "3",
        name: "Кондиционер для волос",
        quantity: 8,
        price: "950.00 ₽",
      },
    ],
    status: "pending",
    address: "г. Москва, ул. Ленина, д. 10",
    amount: "15000 ₽",
    contactPerson: "Иванова Анна Сергеевна",
    contactPhone: "+7 (999) 123-45-67",
    notes: "Доставка желательна в первой половине дня",
  })

  // Функция для принятия запроса на поставку
  // TODO: Заменить на вызов API для принятия запроса
  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      // API запрос на принятие запроса
      // Пример:
      // const response = await fetch(`/api/delivery-requests/${params.id}/accept`, {
      //   method: 'POST'
      // })
      // if (!response.ok) throw new Error('Ошибка при принятии запроса')

      // Имитация задержки принятия запроса
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Обновление UI после успешного принятия
      setRequest((prev) => ({ ...prev, status: "accepted" }))
      alert(`Запрос ${request.number} принят. Создана поставка.`)

      // Перенаправление на страницу со списком запросов
      router.push("/delivery-requests")
    } catch (error) {
      console.error("Ошибка при принятии запроса:", error)
      alert("Произошла ошибка при принятии запроса. Пожалуйста, попробуйте снова.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Функция для отклонения запроса на поставку
  // TODO: Заменить на вызов API для отклонения запроса
  const handleReject = async () => {
    setIsProcessing(true)
    try {
      // API запрос на отклонение запроса
      // Пример:
      // const response = await fetch(`/api/delivery-requests/${params.id}/reject`, {
      //   method: 'POST'
      // })
      // if (!response.ok) throw new Error('Ошибка при отклонении запроса')

      // Имитация задержки отклонения запроса
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Обновление UI после успешного отклонения
      setRequest((prev) => ({ ...prev, status: "rejected" }))
      alert(`Запрос ${request.number} отклонен.`)

      // Перенаправление на страницу со списком запросов
      router.push("/delivery-requests")
    } catch (error) {
      console.error("Ошибка при отклонении запроса:", error)
      alert("Произошла ошибка при отклонении запроса. Пожалуйста, попробуйте снова.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Рендер страницы просмотра запроса на поставку
  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок страницы с кнопкой возврата и статусом запроса */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Запрос на поставку #{request.number}</h2>
        <div className="ml-auto">{getStatusBadge(request.status)}</div>
      </div>

      {/* Информация о заказчике и детали запроса */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Карточка с информацией о заказчике */}
        <Card>
          <CardHeader>
            <CardTitle>Информация о заказчике</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Название</p>
              <p>{request.customer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Адрес</p>
              <p>{request.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Контактное лицо</p>
              <p>{request.contactPerson}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Телефон</p>
              <p>{request.contactPhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Карточка с деталями запроса */}
        <Card>
          <CardHeader>
            <CardTitle>Детали запроса</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Номер запроса</p>
              <p>{request.number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Дата запроса</p>
              <p>{new Date(request.requestDate).toLocaleDateString("ru-RU")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Общая сумма</p>
              <p className="font-bold">{request.amount}</p>
            </div>
            {request.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Примечания</p>
                <p>{request.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Таблица с товарами в запросе */}
      <Card>
        <CardHeader>
          <CardTitle>Товары</CardTitle>
          <CardDescription>Список товаров в запросе на поставку</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Название</th>
                  <th className="h-10 px-4 text-left font-medium">Количество</th>
                  <th className="h-10 px-4 text-left font-medium">Цена за единицу</th>
                  <th className="h-10 px-4 text-right font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {request.products.map((product) => {
                  // Расчет суммы для каждого товара
                  const price = Number.parseFloat(product.price.replace(/[^\d.]/g, ""))
                  const total = price * product.quantity
                  const formattedTotal = `${total.toFixed(2)} ₽`

                  return (
                    <tr key={product.id} className="border-b">
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.quantity} шт.</td>
                      <td className="p-4">{product.price}</td>
                      <td className="p-4 text-right font-medium">{formattedTotal}</td>
                    </tr>
                  )
                })}
                <tr>
                  <td colSpan={3} className="p-4 text-right font-medium">
                    Итого:
                  </td>
                  <td className="p-4 text-right font-bold">{request.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки принятия и отклонения запроса (только для запросов в статусе "pending") */}
      {request.status === "pending" && (
        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isProcessing}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
          >
            <X className="h-4 w-4 mr-2" /> Отклонить запрос
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
          >
            <Check className="h-4 w-4 mr-2" /> Принять запрос
          </Button>
        </div>
      )}
    </div>
  )
}
