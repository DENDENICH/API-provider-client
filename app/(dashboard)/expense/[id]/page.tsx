"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { productsService } from "@/lib/api-services"
import type { ProductResponse } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Загрузка данных о товаре
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!resolvedParams.id || resolvedParams.id === "create") {
        router.push("/products/create")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Сначала пытаемся получить данные из localStorage (если пришли со страницы склада)
        const cachedExpense = localStorage.getItem(`expense_${resolvedParams.id}`)

        if (cachedExpense) {
          const expenseData = JSON.parse(cachedExpense)
          // Преобразуем данные expense в формат ProductResponse
          const productData: ProductResponse = {
            id: expenseData.product_id,
            article: expenseData.article,
            name: expenseData.product_name,
            category: expenseData.category,
            description: expenseData.description,
            price: 0, // Цена не доступна в expense данных
            quantity: expenseData.quantity, // Количество из expense
            organizer_name: expenseData.supplier_name,
          }
          setProduct(productData)
        } else {
          // Если нет кэшированных данных, загружаем через API
          const expenseId = Number.parseInt(resolvedParams.id)
          if (isNaN(expenseId)) {
            throw new Error("Некорректный ID товара")
          }

          console.log("Fetching expense details for ID:", expenseId)
          // Здесь нужно будет добавить API метод для получения конкретного expense
          // Пока используем существующий метод products
          const productData = await productsService.getProduct(expenseId)
          setProduct(productData)
        }
      } catch (error) {
        console.error("Error fetching expense details:", error)
        setError("Не удалось загрузить информацию о товаре")
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить информацию о товаре",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenseData()
  }, [resolvedParams.id, router, toast])

  // Функция для перехода на страницу редактирования
  const handleEditProduct = () => {
    if (product) {
      router.push(`/products/manage/${product.id}/edit`)
    }
  }

  // Отображение индикатора загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Информация о товаре</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Если произошла ошибка или товар не найден
  if (error || !product) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Информация о товаре</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">{error || "Товар не найден"}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Вернуться назад
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Функция для получения читаемого названия категории
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      hair_coloring: "Окрашивание волос",
      hair_care: "Уход за волосами",
      hair_styling: "Стайлинг для волос",
      consumables: "Расходники",
      perming: "Химическая завивка",
      eyebrows: "Брови",
      eyebrows_and_eyelashes: "Брови и ресницы",
      manicure_and_pedicure: "Маникюр и педикюр",
      tools_and_equipment: "Инструменты и оборудование",
    }
    return categoryMap[category] || category
  }

  // Отображение информации о товаре
  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок страницы с кнопками */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Информация о товаре</h2>
        </div>
        {user?.organizerRole === "supplier" && (
          <Button
            onClick={handleEditProduct}
            style={{
              backgroundColor: "#f97316",
              color: "white",
              borderColor: "#f97316",
            }}
            className="hover:bg-[#ea580c]"
          >
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
        )}
      </div>

      {/* Основная информация о товаре */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Название</p>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Артикул</p>
              <p>{product.article}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Категория</p>
              <p>{getCategoryDisplayName(product.category)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Цена за единицу</p>
              <p className="text-lg font-semibold">{product.price.toFixed(2)} ₽</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{product.description || "Описание отсутствует"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Поставщик</p>
              <p>{product.organizer_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID товара</p>
              <p>{product.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
