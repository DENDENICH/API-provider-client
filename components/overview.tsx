"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { SuppliesStatisticOfMonthItem } from "@/lib/api-types"

interface OverviewProps {
  data?: SuppliesStatisticOfMonthItem[]
}

// Функция для преобразования формата месяца из "2025-05" в "Май"
const formatMonth = (monthString: string): string => {
  const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]

  try {
    const [year, month] = monthString.split("-")
    const monthIndex = Number.parseInt(month, 10) - 1
    return monthNames[monthIndex] || monthString
  } catch {
    return monthString
  }
}

// Функция для создания полного набора данных за год
const prepareChartData = (apiData?: SuppliesStatisticOfMonthItem[]) => {
  const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]

  // Создаем базовый массив с нулевыми значениями
  const chartData = monthNames.map((month) => ({
    month,
    count: 0,
  }))

  // Если есть данные от API, обновляем соответствующие месяцы
  if (apiData && apiData.length > 0) {
    apiData.forEach((item) => {
      const formattedMonth = formatMonth(item.month)
      const monthIndex = monthNames.indexOf(formattedMonth)
      if (monthIndex !== -1) {
        chartData[monthIndex].count = item.count
      }
    })
  }

  return chartData
}

export function Overview({ data }: OverviewProps) {
  const chartData = prepareChartData(data)

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
