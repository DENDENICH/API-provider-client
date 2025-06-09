"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { usersService } from "@/lib/api-services"
import { useToast } from "@/components/ui/use-toast"
import { ApiClientError } from "@/lib/api-client"

export function NotOrganizerDashboard() {
  const [linkCode, setLinkCode] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchLinkCode = async () => {
      try {
        setIsLoading(true)
        const response = await usersService.getLinkCode()
        setLinkCode(response.linkcode)
        setError(null)
      } catch (err) {
        console.error("Ошибка при получении кода привязки:", err)
        if (err instanceof ApiClientError) {
          setError(err.message)
        } else {
          setError("Не удалось получить код привязки. Попробуйте позже.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchLinkCode()
  }, [])

  const copyToClipboard = async () => {
    if (!linkCode) return

    const codeText = linkCode.toString().padStart(10, "0")

    try {
      // Проверяем поддержку современного API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(codeText)
      } else {
        // Fallback для старых браузеров или HTTP
        const textArea = document.createElement("textarea")
        textArea.value = codeText
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        textArea.remove()
      }

      toast({
        title: "Код скопирован",
        description: "Код привязки скопирован в буфер обмена",
      })
    } catch (err) {
      console.error("Ошибка копирования:", err)
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать код",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Код привязки к организации</CardTitle>
          <CardDescription className="text-center">
            У вас пока нет учетной записи в организации. Пожалуйста, поделитесь данным кодом с администратором
            организации для добавления вашей учетной записи в компанию.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <div className="text-4xl font-mono font-bold tracking-wider bg-muted p-4 rounded-md w-full text-center">
              {linkCode?.toString().padStart(10, "0")}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={copyToClipboard} className="w-full" disabled={isLoading || !linkCode} variant="outline">
            <Icons.copy className="mr-2 h-4 w-4" />
            Копировать код
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
