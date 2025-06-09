"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/overview"
import { RecentDeliveries } from "@/components/recent-deliveries"
import { CompanyDashboard } from "@/components/company-dashboard"
import { SupplierDashboard } from "@/components/supplier-dashboard"
import { NotOrganizerDashboard } from "@/components/not-organizer-dashboard"
import { useAuth } from "@/contexts/auth-context"
import { dashboardService } from "@/lib/api-services"
import type { StatisticCompany, StatisticSupplier } from "@/lib/api-types"

export default function DashboardPage() {
  const { user } = useAuth()
  const [companyStats, setCompanyStats] = useState<StatisticCompany | null>(null)
  const [supplierStats, setSupplierStats] = useState<StatisticSupplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.organizerRole || user.organizerRole === "not_have_organizer") {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        if (user.organizerRole === "company") {
          const data = await dashboardService.getCompanyStats()
          setCompanyStats(data)
        } else if (user.organizerRole === "supplier") {
          const data = await dashboardService.getSupplierStats()
          setSupplierStats(data)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Если пользователь не имеет организации
  if (user?.organizerRole === "not_have_organizer") {
    return <NotOrganizerDashboard />
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {/* Статистические карточки */}
          {user?.organizerRole === "company" && <CompanyDashboard />}
          {user?.organizerRole === "supplier" && <SupplierDashboard />}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Обзор</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview
                  data={
                    user?.organizerRole === "company"
                      ? companyStats?.supplies_statistic_of_month
                      : supplierStats?.supplies_statistic_of_month
                  }
                />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Недавние поставки</CardTitle>
                <CardDescription>Последние поставки в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentDeliveries />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
