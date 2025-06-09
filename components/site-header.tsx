import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          {/* Заменяем логотип на текст ROSSO оранжевым цветом */}
          <span className="text-2xl font-bold text-[#f97316]">ROSSO</span>
        </div>
        {/* Смещаем навигационные ссылки вправо */}
        <div className="flex-1 flex justify-center">
          <MainNav className="ml-32" />
        </div>
        <div className="flex items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {/* Удаляем ThemeToggle */}
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}
