"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Textarea } from "@/components/ui/textarea"
import { productsService } from "@/lib/api-services"
import type { ProductRequest } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

// Компонент для ввода цены
const PriceInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { onValueChange: (value: string) => void }
>(({ onValueChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Удаляем все нецифровые символы, кроме точки
    let value = e.target.value.replace(/[^\d.]/g, "")

    // Проверяем, что точка только одна
    const dotCount = (value.match(/\./g) || []).length
    if (dotCount > 1) {
      const parts = value.split(".")
      value = parts[0] + "." + parts.slice(1).join("")
    }

    // Ограничиваем до двух знаков после точки
    if (value.includes(".")) {
      const parts = value.split(".")
      if (parts[1].length > 2) {
        value = parts[0] + "." + parts[1].substring(0, 2)
      }
    }

    // Обновляем значение в форме (только числовое значение)
    onValueChange(value)

    // Форматируем для отображения
    let formattedValue = value
    if (value) {
      // Если нет точки, добавляем .00
      if (!value.includes(".")) {
        formattedValue = value + ".00"
      }
      // Если есть точка, но только один знак после, добавляем 0
      else if (value.split(".")[1].length === 1) {
        formattedValue = value + "0"
      }

      // Добавляем символ рубля
      formattedValue = formattedValue + " ₽"
    }

    // Устанавливаем отформатированное значение в поле ввода
    e.target.value = formattedValue
  }

  return <Input ref={ref} onChange={handleChange} {...props} />
})
PriceInput.displayName = "PriceInput"

// Схема валидации формы
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Название должно содержать не менее 2 символов",
  }),
  category: z.string({
    required_error: "Выберите категорию",
  }),
  price: z.string().min(1, {
    message: "Введите цену",
  }),
  quantity: z.number().min(0, {
    message: "Количество не может быть отрицательным",
  }),
  description: z.string().optional(),
})

export function CreateProductForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Инициализация формы
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      quantity: 0,
      description: "",
    },
  })

  // Обработчик отправки формы
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      console.log("Creating product with values:", values)

      // Подготовка данных для API
      const productData: ProductRequest = {
        name: values.name,
        category: values.category as any, // Приведение к типу ProductCategory
        price: Number.parseFloat(values.price),
        description: values.description || "",
        quantity: values.quantity,
      }

      console.log("Product data for API:", productData)

      // Отправка запроса на создание товара
      await productsService.addProduct(productData)

      toast({
        title: "Товар создан",
        description: `Товар "${values.name}" успешно создан`,
      })

      // Перенаправление на страницу расходов
      router.push("/expense")
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Ошибка создания",
        description: "Не удалось создать товар. Попробуйте снова.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название товара" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hair_coloring">Окрашивание волос</SelectItem>
                        <SelectItem value="hair_care">Уход за волосами</SelectItem>
                        <SelectItem value="hair_styling">Стайлинг для волос</SelectItem>
                        <SelectItem value="consumables">Расходники</SelectItem>
                        <SelectItem value="perming">Химическая завивка</SelectItem>
                        <SelectItem value="eyebrows">Брови</SelectItem>
                        <SelectItem value="manicure_and_pedicure">Маникюр и педикюр</SelectItem>
                        <SelectItem value="tools_and_equipment">Инструменты и оборудование</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field: { onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Цена за единицу</FormLabel>
                    <FormControl>
                      <PriceInput placeholder="0.00 ₽" onValueChange={onChange} {...fieldProps} />
                    </FormControl>
                    <FormDescription>Введите цену в рублях (например, 1200.00)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field: { onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Количество в наличии</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
                        {...fieldProps}
                        value={fieldProps.value?.toString()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Введите описание товара" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/expense")}>
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#f97316",
                  color: "white",
                  borderColor: "#f97316",
                }}
                className="hover:bg-[#ea580c]"
              >
                {isSubmitting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Создать товар"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
