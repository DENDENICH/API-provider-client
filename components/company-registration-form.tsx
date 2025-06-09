"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import type { OrganizerRegisterRequest } from "@/lib/api-types"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Название компании должно содержать не менее 2 символов",
  }),
  role: z.enum(["company", "supplier"], {
    required_error: "Пожалуйста, выберите тип компании",
  }),
  address: z.string().min(5, {
    message: "Адрес должен содержать не менее 5 символов",
  }),
  inn: z.string().min(10, {
    message: "ИНН должен содержать не менее 10 символов",
  }),
  bank_details: z.string().min(5, {
    message: "Банковские реквизиты должны содержать не менее 5 символов",
  }),
})

export function CompanyRegistrationForm() {
  const router = useRouter()
  const { registerOrganization } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "company",
      address: "",
      inn: "",
      bank_details: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const orgData: OrganizerRegisterRequest = {
        name: values.name,
        role: values.role,
        address: values.address,
        inn: values.inn,
        bank_details: values.bank_details,
      }

      console.log("Calling registerOrganization with:", orgData)

      // Создаем базовый объект пользователя в localStorage, если его нет
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        // Получаем актуальные данные пользователя
        const email = localStorage.getItem("registered_email") || "user@example.com"
        const name = localStorage.getItem("registered_name") || email.split("@")[0]

        const newUser = {
          id: "user-1",
          name,
          email,
          organizerRole: "not_have_organizer",
          userRole: "admin",
        }

        console.log("Creating initial user object:", newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
      }

      await registerOrganization(orgData)
      console.log("registerOrganization completed successfully")

      // Перезагрузка страницы для применения изменений
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Error in registerOrganization:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ошибка регистрации организации. Попробуйте еще раз.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название компании</FormLabel>
                <FormControl>
                  <Input placeholder="ООО 'Компания'" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип компании</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип компании" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="company">Компания</SelectItem>
                    <SelectItem value="supplier">Поставщик</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Адрес</FormLabel>
                <FormControl>
                  <Textarea placeholder="г. Москва, ул. Ленина, д. 10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ИНН</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Банковские реквизиты</FormLabel>
                <FormControl>
                  <Textarea placeholder="Р/с 40702810123450101230 в Банке..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          <Button disabled={isLoading} className="w-full">
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Зарегистрировать компанию
          </Button>
        </form>
      </Form>
    </div>
  )
}
