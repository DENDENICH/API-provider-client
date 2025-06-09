"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus } from "lucide-react"
import { Icons } from "@/components/icons"
import { suppliersService, productsService, suppliesService } from "@/lib/api-services"
import { useToast } from "@/hooks/use-toast"
import type { SupplierResponse, ProductResponse, SupplyCreateRequest } from "@/lib/api-types"

// Типы данных для выбранного товара
type SelectedProduct = {
  id: number
  quantity: number
}

// Схема валидации формы
const formSchema = z.object({
  supplier: z.string({
    required_error: "Выберите поставщика",
  }),
  address: z.string().min(1, "Введите адрес доставки"),
  selectedProducts: z
    .array(
      z.object({
        id: z.number(),
        quantity: z.number().min(1, "Количество должно быть больше 0"),
      }),
    )
    .min(1, "Выберите хотя бы один товар"),
})

// Функция для преобразования категории в читаемый вид
const getCategoryDisplayName = (category: string): string => {
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

export function CreateDeliveryForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([])
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const [totalAmount, setTotalAmount] = useState<number>(0)

  // Инициализация формы
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: "",
      address: "",
      selectedProducts: [],
    },
  })

  // Загрузка списка поставщиков при монтировании компонента
  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoadingSuppliers(true)
      try {
        console.log("Fetching suppliers...")
        const response = await suppliersService.getSuppliers()
        console.log("Suppliers response:", response)
        setSuppliers(response.organizers || [])
      } catch (error) {
        console.error("Error fetching suppliers:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список поставщиков",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSuppliers(false)
      }
    }

    fetchSuppliers()
  }, [toast])

  // Загрузка списка товаров при выборе поставщика
  useEffect(() => {
    if (selectedSupplier) {
      const fetchProducts = async () => {
        setIsLoadingProducts(true)
        try {
          console.log("Fetching products for supplier:", selectedSupplier)
          const response = await productsService.getProducts(Number.parseInt(selectedSupplier), true)
          console.log("Products response:", response)
          setProducts(response.products || [])
          // Сбрасываем выбранные товары при смене поставщика
          setSelectedProducts([])
          form.setValue("selectedProducts", [])
          setTotalAmount(0)
        } catch (error) {
          console.error("Error fetching products:", error)
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить список товаров",
            variant: "destructive",
          })
        } finally {
          setIsLoadingProducts(false)
        }
      }

      fetchProducts()
    }
  }, [selectedSupplier, form, toast])

  // Обновление общей суммы при изменении выбранных товаров
  useEffect(() => {
    let total = 0
    selectedProducts.forEach((selectedProduct) => {
      const product = products.find((p) => p.id === selectedProduct.id)
      if (product) {
        total += product.price * selectedProduct.quantity
      }
    })
    setTotalAmount(total)
  }, [selectedProducts, products])

  // Обработчик выбора поставщика
  const handleSupplierChange = (value: string) => {
    console.log("Selected supplier:", value)
    setSelectedSupplier(value)
    form.setValue("supplier", value)
  }

  // Обработчик выбора товара
  const handleProductSelect = (productId: number, isChecked: boolean) => {
    if (isChecked) {
      // Добавляем товар в список выбранных
      const newSelectedProduct = { id: productId, quantity: 1 }
      const updatedSelectedProducts = [...selectedProducts, newSelectedProduct]
      setSelectedProducts(updatedSelectedProducts)
      form.setValue("selectedProducts", updatedSelectedProducts)
    } else {
      // Удаляем товар из списка выбранных
      const updatedSelectedProducts = selectedProducts.filter((p) => p.id !== productId)
      setSelectedProducts(updatedSelectedProducts)
      form.setValue("selectedProducts", updatedSelectedProducts)
    }
  }

  // Обработчик изменения количества товара
  const handleQuantityChange = (productId: number, change: number) => {
    const updatedSelectedProducts = selectedProducts.map((product) => {
      if (product.id === productId) {
        const selectedProduct = products.find((p) => p.id === productId)
        if (selectedProduct) {
          // Проверяем, что новое количество не меньше 1 и не больше доступного
          const maxQuantity = selectedProduct.quantity || 999
          const newQuantity = Math.max(1, Math.min(product.quantity + change, maxQuantity))
          return { ...product, quantity: newQuantity }
        }
      }
      return product
    })
    setSelectedProducts(updatedSelectedProducts)
    form.setValue("selectedProducts", updatedSelectedProducts)
  }

  // Проверка, выбран ли товар
  const isProductSelected = (productId: number) => {
    return selectedProducts.some((p) => p.id === productId)
  }

  // Получение количества выбранного товара
  const getSelectedQuantity = (productId: number) => {
    const selectedProduct = selectedProducts.find((p) => p.id === productId)
    return selectedProduct ? selectedProduct.quantity : 0
  }

  // Обработчик отправки формы
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submission started with values:", values)

    // Дополнительная валидация
    if (!values.address.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Введите адрес доставки",
        variant: "destructive",
      })
      return
    }

    if (values.selectedProducts.length === 0) {
      toast({
        title: "Ошибка валидации",
        description: "Выберите хотя бы один товар",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Подготовка данных для отправки
      const supplyData: SupplyCreateRequest = {
        supplier_id: Number.parseInt(values.supplier),
        delivery_address: values.address,
        total_price: totalAmount,
        supply_products: values.selectedProducts.map((sp) => ({
          product_id: sp.id,
          quantity: sp.quantity,
        })),
      }

      console.log("Sending supply data:", supplyData)

      const response = await suppliesService.createSupply(supplyData)
      console.log("Supply created successfully:", response)

      toast({
        title: "Успех",
        description: "Поставка успешно создана",
      })

      router.push("/deliveries")
    } catch (error) {
      console.error("Error creating supply:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании поставки",
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
            <div className="space-y-6">
              {/* Выбор поставщика */}
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Поставщик</FormLabel>
                    <Select
                      onValueChange={handleSupplierChange}
                      defaultValue={field.value}
                      disabled={isLoadingSuppliers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingSuppliers ? "Загрузка..." : "Выберите поставщика"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Выберите поставщика из списка</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Список товаров */}
              {selectedSupplier && (
                <div className="space-y-4">
                  <FormLabel>Товары</FormLabel>
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center p-8">
                      <Icons.spinner className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Загрузка товаров...</span>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="border rounded-md">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                        <div className="col-span-1"></div>
                        <div className="col-span-2">Артикул</div>
                        <div className="col-span-3">Название товара</div>
                        <div className="col-span-2">Категория</div>
                        <div className="col-span-2">Цена за ед.</div>
                        <div className="col-span-2">Количество</div>
                      </div>
                      <div className="divide-y">
                        {products.map((product) => (
                          <div key={product.id} className="grid grid-cols-12 gap-2 p-3 items-center">
                            <div className="col-span-1">
                              <Checkbox
                                checked={isProductSelected(product.id)}
                                onCheckedChange={(checked) => handleProductSelect(product.id, checked as boolean)}
                              />
                            </div>
                            <div className="col-span-2 text-sm">{product.article}</div>
                            <div className="col-span-3 font-medium">{product.name}</div>
                            <div className="col-span-2 text-sm text-muted-foreground">
                              {getCategoryDisplayName(product.category)}
                            </div>
                            <div className="col-span-2 text-sm">{product.price.toLocaleString()} ₽</div>
                            <div className="col-span-2 flex items-center space-x-2">
                              {isProductSelected(product.id) ? (
                                <>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleQuantityChange(product.id, -1)}
                                    disabled={getSelectedQuantity(product.id) <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center">{getSelectedQuantity(product.id)}</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleQuantityChange(product.id, 1)}
                                    disabled={
                                      product.quantity !== null &&
                                      getSelectedQuantity(product.id) >= (product.quantity || 0)
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">Не выбрано</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      У выбранного поставщика нет доступных товаров
                    </div>
                  )}
                  {form.formState.errors.selectedProducts && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.selectedProducts.message}
                    </p>
                  )}
                </div>
              )}

              {/* Адрес доставки */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Адрес доставки</FormLabel>
                    <FormControl>
                      <Textarea placeholder="г. Москва, ул. Ленина, д. 10" className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>Укажите полный адрес доставки</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Итоговая сумма */}
              {selectedProducts.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Итого:</span>
                  <span className="text-xl font-bold">{totalAmount.toLocaleString()} ₽</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/deliveries")}>
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoadingSuppliers || isLoadingProducts}
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
                  "Создать поставку"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
