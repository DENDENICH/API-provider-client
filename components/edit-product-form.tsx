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
import { Icons } from "@/components/icons"
import { Textarea } from "@/components/ui/textarea"
import { productsService } from "@/lib/api-services"
import type { ProductResponse, ProductUpdate } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

// Компонент для ввода цены с форматированием
const PriceInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { onValueChange: (value: string) => void }
>(({ onValueChange, ...props }, ref) => {
  // Обработчик изменения значения в поле ввода цены
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

// Схема валидации формы с использованием Zod
const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Название обязательно для заполнения",
    })
    .min(2, {
      message: "Название должно содержать не менее 2 символов",
    })
    .refine((val) => val.trim().length > 0, {
      message: "Название не может состоять только из пробелов",
    }),
  category: z
    .string({
      required_error: "Выберите категорию",
    })
    .min(1, {
      message: "Категория обязательна для заполнения",
    })
    .refine((val) => val !== "", {
      message: "Необходимо выбрать категорию",
    }),
  price: z
    .string()
    .min(1, {
      message: "Цена обязательна для заполнения",
    })
    .refine((val) => val.trim() !== "", {
      message: "Цена не может быть пустой",
    })
    .refine(
      (val) => {
        const num = Number.parseFloat(val)
        return !isNaN(num) && num > 0
      },
      {
        message: "Цена должна быть положительным числом",
      },
    ),
  description: z.string().optional(),
})

// Компонент формы редактирования товара
export function EditProductForm({ product, onSuccess }: { product: ProductResponse; onSuccess?: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Инициализация формы с использованием react-hook-form и zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || "",
    },
  })

  // Обработчик отправки формы
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Дополнительная проверка перед отправкой
    if (!values.name.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Название товара не может быть пустым",
        variant: "destructive",
      })
      return
    }

    if (!values.category) {
      toast({
        title: "Ошибка валидации",
        description: "Необходимо выбрать категорию товара",
        variant: "destructive",
      })
      return
    }

    if (!values.price || Number.parseFloat(values.price) <= 0) {
      toast({
        title: "Ошибка валидации",
        description: "Цена должна быть положительным числом",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Updating product with values:", values)

      // Подготовка данных для API согласно схеме ProductUpdate
      const updateData: ProductUpdate = {
        name: values.name,
        category: values.category as any, // Приведение к типу ProductCategory
        price: Number.parseFloat(values.price),
        description: values.description || "",
      }

      console.log("Product update data for API:", updateData)

      // API запрос для обновления товара
      await productsService.updateProduct(product.id, updateData as any)

      toast({
        title: "Товар обновлен",
        description: `Товар "${values.name}" успешно обновлен`,
      })

      // Перенаправление после успешного обновления
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/products/manage")
      }
    } catch (error: any) {
      console.error("Error updating product:", error)

      let errorMessage = "Не удалось обновить товар. Попробуйте снова."

      if (error.response?.status === 422) {
        // Обработка ошибки валидации 422
        errorMessage = "Ошибка валидации данных. Проверьте заполнение всех обязательных полей:"

        // Проверяем какие поля могут быть незаполнены
        const errors = []
        if (!values.name.trim()) errors.push("• Название товара")
        if (!values.category) errors.push("• Категория товара")
        if (!values.price || Number.parseFloat(values.price) <= 0) errors.push("• Цена товара")

        if (errors.length > 0) {
          errorMessage += "\n" + errors.join("\n")
        } else {
          errorMessage =
            "Проверьте правильность заполнения всех полей. Название, категория и цена обязательны для заполнения."
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Ошибка обновления товара",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Рендер формы редактирования товара
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Поле для ввода названия товара */}
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

          {/* Поле для выбора категории товара */}
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

          {/* Поле для ввода цены товара */}
          <FormField
            control={form.control}
            name="price"
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Цена за единицу</FormLabel>
                <FormControl>
                  <PriceInput
                    placeholder="0.00 ₽"
                    onValueChange={onChange}
                    defaultValue={`${value} ₽`}
                    {...fieldProps}
                  />
                </FormControl>
                <FormDescription>Введите цену в рублях (например, 1200.00)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Поле для ввода описания товара */}
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

        {/* Кнопки отмены и сохранения */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
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
                Сохранение...
              </>
            ) : (
              "Сохранить изменения"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
