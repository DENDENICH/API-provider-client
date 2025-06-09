"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmployeeRegistrationForm } from "@/components/employee-registration-form"
import { Icons } from "@/components/icons"

export default function InviteRegistrationPage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [inviteData, setInviteData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // В реальном приложении здесь будет API-запрос для проверки кода приглашения
    const validateInviteCode = async () => {
      setIsLoading(true)
      try {
        // Имитация запроса к API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Для демонстрации: проверяем, что код состоит только из букв и цифр
        if (/^[A-Z0-9]{8}$/.test(params.code)) {
          // Имитация данных приглашения
          setInviteData({
            code: params.code,
            organizationName: "ООО 'Компания'",
            organizationType: Math.random() > 0.5 ? "company" : "supplier",
            position: "Менеджер",
            department: "Продажи",
            role: "manager",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          setError(null)
        } else {
          setError("Недействительный код приглашения")
          setInviteData(null)
        }
      } catch (err) {
        console.error("Ошибка при проверке кода приглашения:", err)
        setError("Произошла ошибка при проверке кода приглашения")
        setInviteData(null)
      } finally {
        setIsLoading(false)
      }
    }

    validateInviteCode()
  }, [params.code])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Проверка кода приглашения...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Ошибка</CardTitle>
          <CardDescription>Не удалось проверить код приглашения</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Пожалуйста, проверьте правильность кода или запросите новый код приглашения.
          </p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Вернуться на страницу входа
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Регистрация сотрудника</h1>
        <p className="text-sm text-muted-foreground">
          Вы были приглашены присоединиться к организации {inviteData.organizationName}
        </p>
      </div>
      <EmployeeRegistrationForm inviteData={inviteData} />
    </div>
  )
}
