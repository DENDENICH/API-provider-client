"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import { useState, useEffect } from "react"

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)

  // Имитация загрузки данных о товаре
  useEffect(() => {
    // В реальном приложении здесь будет запрос к API
    setTimeout(() => {
      setProduct({
        id: params.id,
        name: "Шампунь для окрашенных волос",
        category: "Уход за волосами",
        articleNumber: "SH-1001",
        price: "1200.00 ₽",
        stock: 45,
        description: "Профессиональный шампунь для окрашенных волос. Сохраняет цвет и придает блеск.",
        image: null,
      })
      setIsLoading(false)
    }, 500)
  }, [params.id])

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Информация о товаре</h2>
        <div className="ml-auto">
          <Button onClick={() => router.push(`/products/${params.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" /> Редактировать
          </Button>
        </div>
      </div>

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
              <p className="text-sm font-medium text-muted-foreground">Категория</p>
              <p>{product.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Артикул</p>
              <p>{product.articleNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Цена</p>
              <p className="text-lg font-semibold">{product.price}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">В наличии</p>
              <p
                className={`font-medium ${product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-yellow-500" : "text-green-500"}`}
              >
                {product.stock} шт.
              </p>
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

      <Card>
        <CardHeader>
          <CardTitle>Изображение товара</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          {product.image ? (
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="max-h-[300px] object-contain rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] w-full bg-muted rounded-md">
              <p className="text-muted-foreground">Изображение отсутствует</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
