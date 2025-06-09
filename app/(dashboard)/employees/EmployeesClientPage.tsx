"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeesTable } from "@/components/employees-table"
import { InviteEmployeeForm } from "@/components/invite-employee-form"
import { useAuth } from "@/contexts/auth-context"

export default function EmployeesClientPage() {
  const [activeTab, setActiveTab] = useState("list")
  const { user, hasPermission } = useAuth()

  // Определяем, может ли пользователь добавлять сотрудников
  const canAddEmployees = hasPermission("add_employees")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Сотрудники</h2>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Список сотрудников</TabsTrigger>
          {/* Показываем вкладку "Добавить сотрудника" только если есть права */}
          {canAddEmployees && <TabsTrigger value="add">Добавить сотрудника</TabsTrigger>}
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <EmployeesTable />
        </TabsContent>
        {canAddEmployees && (
          <TabsContent value="add" className="mt-4">
            <InviteEmployeeForm organizationType={user?.organizerRole || "company"} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
