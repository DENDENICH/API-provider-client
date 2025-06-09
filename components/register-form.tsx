"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { ErrorAlert } from "@/components/ui/error-alert"
import { ApiClientError } from "@/lib/api-client"
import type { UserRegisterRequest } from "@/lib/api-types"

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/
const russianNameRegex = /^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/
const phoneRegex = /^(\+7|8)[0-9]{10}$/

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Имя должно содержать не менее 2 символов",
    })
    .regex(russianNameRegex, {
      message: "ФИО должно быть на русском языке и содержать фамилию, имя и отчество (например: Иванов Иван Иванович)",
    }),
  email: z.string().email({
    message: "Пожалуйста, введите корректный email",
  }),
  phone: z.string().regex(phoneRegex, {
    message: "Номер телефона должен быть в формате +79991234567 или 89991234567",
  }),
  password: z
    .string()
    .min(8, {
      message: "Пароль должен содержать не менее 8 символов",
    })
    .regex(passwordRegex, {
      message: "Пароль должен содержать буквы, цифры и специальные символы",
    }),
  user_type: z.enum(["organizer", "employee"], {
    required_error: "Пожалуйста, выберите тип пользователя",
  }),
})

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [errorCode, setErrorCode] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      user_type: "organizer",
    },
  })

  // Очищаем ошибку при изменении полей
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (error) {
        setError(null)
        setErrorCode(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, error])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setErrorCode(null)

    try {
      const userData: UserRegisterRequest = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        user_type: values.user_type,
      }

      const response = await register(userData)

      // Добавляем отладочную информацию
      console.log("Registration response:", response)
      console.log("Next route:", response?.next_route)
      console.log("User type:", values.user_type)

      // Проверяем next_route из ответа API
      if (response && response.next_route === "organizers/register") {
        console.log("Redirecting to company registration")
        router.push("/register/company")
      } else {
        console.log("Redirecting to dashboard")
        router.push("/dashboard")
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
        setErrorCode(err.code)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ошибка регистрации. Попробуйте еще раз.")
      }
      console.error(err)
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
            name="user_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип пользователя</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип пользователя" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employee">Сотрудник</SelectItem>
                    <SelectItem value="organizer">Организация</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input placeholder="+79991234567" {...field} />
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

          {error && (
            <ErrorAlert
              title="Ошибка регистрации"
              message={error}
              variant="destructive"
              onClose={() => {
                setError(null)
                setErrorCode(null)
              }}
            >
              {errorCode === "USER_ALREADY_EXISTS" && (
                <div className="mt-2">
                  <Link href="/login" className="text-sm underline hover:no-underline">
                    Войти в существующий аккаунт
                  </Link>
                </div>
              )}
            </ErrorAlert>
          )}

          <Button disabled={isLoading} className="w-full">
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Зарегистрироваться
          </Button>
        </form>
      </Form>
    </div>
  )
}
