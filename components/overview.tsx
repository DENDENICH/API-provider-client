"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { SuppliesStatisticOfMonthItem } from "@/lib/api-types"

interface OverviewProps {
  data?: SuppliesStatisticOfMonthItem[]
}

export function Overview({ data }: OverviewProps) {
  // Если данные не переданы, используем заглушку
  const chartData = data || [
    { month: "Янв", count: 0 },
    { month: "Фев", count: 0 },
    { month: "Мар", count: 0 },
    { month: "Апр", count: 0 },
    { month: "Май", count: 0 },
    { month: "Июн", count: 0 },
    { month: "Июл", count: 0 },
    { month: "Авг", count: 0 },
    { month: "Сен", count: 0 },
    { month: "Окт", count: 0 },
    { month: "Ноя", count: 0 },
    { month: "Дек", count: 0 },
  ]

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
