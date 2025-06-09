"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Янв",
    total: 12,
  },
  {
    name: "Фев",
    total: 16,
  },
  {
    name: "Мар",
    total: 18,
  },
  {
    name: "Апр",
    total: 14,
  },
  {
    name: "Май",
    total: 22,
  },
  {
    name: "Июн",
    total: 26,
  },
  {
    name: "Июл",
    total: 24,
  },
  {
    name: "Авг",
    total: 28,
  },
  {
    name: "Сен",
    total: 32,
  },
  {
    name: "Окт",
    total: 30,
  },
  {
    name: "Ноя",
    total: 36,
  },
  {
    name: "Дек",
    total: 42,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
