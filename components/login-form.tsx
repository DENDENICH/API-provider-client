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
import { useAuth } from "@/contexts/auth-context"
import { ApiClientError } from "@/lib/api-client"
import { ErrorAlert } from "@/components/ui/error-alert"

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/

const formSchema = z.object({
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
})

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<ApiClientError | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      await login(values.email, values.password)
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiClientError) {
        // Специальная обработка для 404 - пользователь не найден
        if (err.status === 404) {
          setError(
            new ApiClientError(
              "Пользователь с указанными данными не найден. Проверьте email и пароль или зарегистрируйтесь",
              404,
              "USER_NOT_FOUND",
            ),
          )
    //     } else if (err.code === "NEED_ORG_REGISTRATION") {
    //       router.push("/register/company")
    //       return
    //     } else {
    //       setError(err)
    //     }
    //   } else if (err instanceof Error) {
    //     if (err.message === "NEED_ORG_REGISTRATION") {
    //       router.push("/register/company")
    //       return
    //     }
        }
        setError(new ApiClientError(err.message, 0, "UNKNOWN_ERROR"))
      } else {
        setError(new ApiClientError("Произошла неизвестная ошибка", 0, "UNKNOWN_ERROR"))
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      if (error) clearError()
                    }}
                  />
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
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      if (error) clearError()
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <ErrorAlert error={error} onClose={clearError} className="mt-4" />}

          <Button disabled={isLoading} className="w-full">
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Войти
          </Button>
        </form>
      </Form>
    </div>
  )
}
