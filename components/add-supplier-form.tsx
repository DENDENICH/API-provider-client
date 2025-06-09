"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Icons } from "@/components/icons"
import { suppliersService } from "@/lib/api-services"
import type { SupplierResponse } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  inn: z
    .string()
    .min(10, {
      message: "ИНН должен содержать не менее 10 символов",
    })
    .max(12, {
      message: "ИНН должен содержать не более 12 символов",
    })
    .regex(/^\d+$/, {
      message: "ИНН должен содержать только цифры",
    }),
})

interface AddSupplierFormProps {
  onSupplierAdded?: () => void
}

export function AddSupplierForm({ onSupplierAdded }: AddSupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [supplierFound, setSupplierFound] = useState<SupplierResponse | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inn: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setSupplierFound(null)

    try {
      console.log("Searching supplier by INN:", values.inn)
      const supplier = await suppliersService.getSupplierByInn(Number.parseInt(values.inn))
      console.log("Supplier found:", supplier)
      setSupplierFound(supplier)
      toast({
        title: "Поставщик найден",
        description: `Найден поставщик: ${supplier.name}`,
      })
    } catch (error) {
      console.error("Error searching supplier:", error)
      toast({
        title: "Поставщик не найден",
        description: "Поставщик с указанным ИНН не найден в системе",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSupplier = async () => {
    if (!supplierFound) return

    setIsAdding(true)
    try {
      console.log("Adding supplier with ID:", supplierFound.id)
      await suppliersService.addSupplier(supplierFound.id)
      toast({
        title: "Успешно",
        description: `Поставщик ${supplierFound.name} добавлен в контакты`,
      })
      setSupplierFound(null)
      form.reset()

      // Вызываем callback для обновления списка поставщиков
      if (onSupplierAdded) {
        onSupplierAdded()
      }
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить поставщика в контакты",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить поставщика</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ИНН поставщика</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите ИНН" {...field} />
                  </FormControl>
                  <FormDescription>Введите ИНН поставщика для поиска в системе</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: "#f97316",
                color: "white",
                borderColor: "#f97316",
              }}
              className="hover:bg-[#ea580c]"
            >
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Найти поставщика
            </Button>
          </form>
        </Form>

        {supplierFound && (
          <div className="mt-6 p-4 border rounded-md">
            <h3 className="font-semibold text-lg mb-2">Найден поставщик:</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Название:</span> {supplierFound.name}
              </p>
              <p>
                <span className="font-medium">ИНН:</span> {supplierFound.inn}
              </p>
              <p>
                <span className="font-medium">Адрес:</span> {supplierFound.address}
              </p>
              <p>
                <span className="font-medium">Банковские реквизиты:</span> {supplierFound.bank_details}
              </p>
              <Button onClick={handleAddSupplier} disabled={isAdding} className="mt-4">
                {isAdding && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Заключить контракт
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
