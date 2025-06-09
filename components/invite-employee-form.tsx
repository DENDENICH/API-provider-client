"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { usersService } from "@/lib/api-services"

interface InviteEmployeeFormProps {
  onSuccess?: () => void
}

export function InviteEmployeeForm({ onSuccess }: InviteEmployeeFormProps) {
  const [linkCode, setLinkCode] = React.useState("")
  const [role, setRole] = React.useState<"manager" | "employee">("employee")
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!linkCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код привязки",
        variant: "destructive",
      })
      return
    }

    const linkCodeNumber = Number.parseInt(linkCode.trim())
    if (isNaN(linkCodeNumber)) {
      toast({
        title: "Ошибка",
        description: "Код привязки должен быть числом",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      console.log("Adding user with link code:", linkCodeNumber, "role:", role)

      await usersService.addUserByLinkCode(linkCodeNumber, role)

      // Очищаем форму
      setLinkCode("")
      setRole("employee")

      onSuccess?.()
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить сотрудника. Проверьте код привязки.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="linkCode">Код привязки</Label>
        <Input
          id="linkCode"
          type="text"
          placeholder="Введите 10-значный код"
          value={linkCode}
          onChange={(e) => setLinkCode(e.target.value)}
          maxLength={10}
          required
        />
        <p className="text-sm text-muted-foreground">
          Попросите сотрудника предоставить код привязки из его личного кабинета
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Роль в организации</Label>
        <Select value={role} onValueChange={(value: "manager" | "employee") => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Сотрудник</SelectItem>
            <SelectItem value="manager">Менеджер</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Добавление..." : "Добавить сотрудника"}
      </Button>
    </form>
  )
}
