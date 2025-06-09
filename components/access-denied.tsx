"use client"

import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface AccessDeniedProps {
  title?: string
  description?: string
  showBackButton?: boolean
}

export function AccessDenied({
  title = "Доступ запрещен",
  description = "У вас недостаточно прав для просмотра этой страницы",
  showBackButton = true,
}: AccessDeniedProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        {showBackButton && (
          <CardContent className="text-center">
            <Button onClick={() => router.back()} variant="outline" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
