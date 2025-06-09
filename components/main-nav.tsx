"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    requiredPermission?: string
  }[]
}

export function MainNav({ className, items, ...props }: MainNavProps) {
  const pathname = usePathname()
  const { user, hasPermission } = useAuth()

  // Определяем доступные пункты меню в зависимости от роли и типа организации
  const getNavItems = () => {
    // Если у пользователя нет организации, не показываем никаких пунктов меню
    console.log("/dashboard get")
    console.log("User role - " + user?.userRole)
    console.log("User organizer role - " + user?.organizerRole)


    if (!user || user.organizerRole === "not_have_organizer") {
      return []
    }

    // Для пользователей компании
    if (user.organizerRole === "company") {
      // Для администратора компании
      if (user.userRole === "admin") {
        return [
          {
            href: "/dashboard",
            title: "Панель управления",
          },
          {
            href: "/deliveries",
            title: "Поставки",
          },
          {
            href: "/products",
            title: "Товары",
          },
          {
            href: "/employees",
            title: "Сотрудники",
            requiredPermission: "view_employees",
          },
          {
            href: "/suppliers",
            title: "Поставщики",
            requiredPermission: "view_suppliers",
          },
          {
            href: "/expense",
            title: "Склад",
          },
        ]
      }
      // Для менеджера или сотрудника компании
      else {
        return [
          {
            href: "/dashboard",
            title: "Панель управления",
          },
          {
            href: "/deliveries",
            title: "Поставки",
          },
          {
            href: "/products",
            title: "Товары",
          },
          {
            href: "/expense",
            title: "Склад",
          },
        ]
      }
    }
    // Для пользователей поставщика
    else if (user.organizerRole === "supplier") {
      // Для администратора поставщика
      if (user.userRole === "admin") {
        return [
          {
            href: "/dashboard",
            title: "Панель управления",
          },
          {
            href: "/deliveries",
            title: "Поставки",
          },
          {
            href: "/delivery-requests",
            title: "Запросы на поставку",
          },
          {
            href: "/employees",
            title: "Сотрудники",
            requiredPermission: "view_employees",
          },
          {
            href: "/expense",
            title: "Управление товарами",
          },
        ]
      }
      // Для менеджера или сотрудника поставщика
      else {
        return [
          {
            href: "/dashboard",
            title: "Панель управления",
          },
          {
            href: "/deliveries",
            title: "Поставки",
          },
          {
            href: "/delivery-requests",
            title: "Запросы на поставку",
          },
          {
            href: "/expense",
            title: "Управление товарами",
          },
        ]
      }
    }

    // Если ни одно из условий не выполнено, возвращаем пустой массив
    return []
  }

  const navItems = getNavItems()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {navItems.map((item) => {
        // Если для пункта меню требуется разрешение, проверяем его
        if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
          return null
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-black dark:text-white" : "text-muted-foreground",
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
