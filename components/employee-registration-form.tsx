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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Имя должно содержать не менее 2 символов",
    }),
    email: z.string().email({
      message: "Пожалуйста, введите корректный email",
    }),
    password: z
      .string()
      .min(8, {
        message: "Пароль должен содержать не менее 8 символов",
      })
      .regex(passwordRegex, {
        message: "Пароль должен содержать буквы, цифры и специальные символы",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

export function EmployeeRegistrationForm({ inviteData }: { inviteData: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // В реальном приложении здесь будет API-запрос для регистрации сотрудника
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Данные для отправки на сервер
      const registrationData = {
        name: values.name,
        email: values.email,
        password: values.password,
        inviteCode: inviteData.code,
        organizationType: inviteData.organizationType,
        position: inviteData.position,
        department: inviteData.department,
        role: inviteData.role,
      }

      console.log("Регистрация сотрудника:", registrationData)

      // Перенаправление на дашборд после успешной регистрации
      router.push("/dashboard")
    } catch (error) {
      console.error("Ошибка при регистрации:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Информация о приглашении</CardTitle>
          <CardDescription>Детали вашего приглашения в организацию</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Организация</p>
                <p>{inviteData.organizationName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Должность</p>
                <p>{inviteData.position}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Отдел</p>
                <p>{inviteData.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Роль в системе</p>
                <p className="capitalize">{inviteData.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Код действителен до</p>
                <p>{new Date(inviteData.expiresAt).toLocaleDateString("ru-RU")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ФИО</FormLabel>
                <FormControl>
                  <Input placeholder="Иванов Иван Иванович" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Подтверждение пароля</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} className="w-full">
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Зарегистрироваться
          </Button>
        </form>
      </Form>
    </div>
  )
}
