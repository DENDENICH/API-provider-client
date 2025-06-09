"use client"

import { useAuth } from "@/contexts/auth-context"
import { CompanyDashboard } from "@/components/company-dashboard"
import { SupplierDashboard } from "@/components/supplier-dashboard"
import { NotOrganizerDashboard } from "@/components/not-organizer-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/overview"
import { RecentDeliveries } from "@/components/recent-deliveries"
import { useState, useEffect } from "react"
import { dashboardService } from "@/lib/api-services"
import type { StatisticCompany, StatisticSupplier, SuppliesStatisticOfMonthItem } from "@/lib/api-types"

export default function DashboardPage() {
  const { user } = useAuth()
  const [chartData, setChartData] = useState<SuppliesStatisticOfMonthItem[]>([])
  const [isLoadingChart, setIsLoadingChart] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      if (!user?.organizerRole || user.organizerRole === "not_have_organizer") {
        setIsLoadingChart(false)
        return
      }

      try {
        setIsLoadingChart(true)
        let stats: StatisticCompany | StatisticSupplier

        if (user.organizerRole === "company") {
          stats = await dashboardService.getCompanyStats()
        } else {
          stats = await dashboardService.getSupplierStats()
        }

        setChartData(stats.supplies_statistic_of_month || [])
      } catch (error) {
        console.error("Error loading chart data:", error)
        setChartData([])
      } finally {
        setIsLoadingChart(false)
      }
    }

    loadChartData()
  }, [user?.organizerRole])

  // Если пользователь не имеет организации
  if (!user?.organizerRole || user.organizerRole === "not_have_organizer") {
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
          {user.organizerRole === "company" ? <CompanyDashboard /> : <SupplierDashboard />}

          {/* Графики и дополнительная информация */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Обзор</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoadingChart ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <div className="text-muted-foreground">Загрузка графика...</div>
                  </div>
                ) : (
                  <Overview data={chartData} />
                )}
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
