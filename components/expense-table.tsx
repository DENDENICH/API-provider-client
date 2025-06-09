"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Eye, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { expensesService } from "@/lib/api-services"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Plus } from "lucide-react"
import Link from "next/link"

// Типы данных для товара на складе
type ExpenseItem = {
  id: string
  articleNumber: string
  name: string
  organization: string
  category: string
  quantity: number
  description?: string
  product_id: number
}

const ExpenseTableComponent = () => {
  const { user } = useAuth()
  const [expenses, setExpenses] = React.useState<ExpenseItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()

  // Добавьте useEffect для загрузки данных
  React.useEffect(() => {
    fetchExpenses()
  }, [])

  // Добавьте функцию загрузки данных
  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching expenses...")

      const response = await expensesService.getExpenses()
      console.log("Expenses API response:", response)

      // Преобразуем данные из API в формат таблицы
      const transformedExpenses: ExpenseItem[] = response.expenses.map((expense) => ({
        id: expense.id.toString(),
        articleNumber: expense.article.toString(),
        name: expense.product_name,
        organization: expense.supplier_name,
        category: getCategoryDisplayName(expense.category),
        quantity: expense.quantity,
        description: expense.description,
        product_id: expense.product_id,
      }))

      setExpenses(transformedExpenses)
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные склада",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Добавьте функцию для преобразования категорий
  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      hair_coloring: "Окрашивание волос",
      hair_care: "Уход за волосами",
      hair_styling: "Стайлинг для волос",
      consumables: "Расходники",
      perming: "Химическая завивка",
      eyebrows: "Брови",
      eyebrows_and_eyelashes: "Брови и ресницы",
      manicure_and_pedicure: "Маникюр и педикюр",
      tools_and_equipment: "Инструменты и оборудование",
    }
    return categoryMap[category] || category
  }

  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  // Добавьте следующие состояния после объявления состояний sorting, columnFilters и т.д.:
  const [isStockDialogOpen, setIsStockDialogOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<ExpenseItem | null>(null)
  const [newStockValue, setNewStockValue] = React.useState<number>(0)
  const [isUpdating, setIsUpdating] = React.useState(false)

  // Добавьте следующие функции перед определением колонок:

  // Функция для открытия модального окна редактирования количества
  const handleOpenStockDialog = (item: ExpenseItem) => {
    setSelectedItem(item)
    setNewStockValue(item.quantity)
    setIsStockDialogOpen(true)
  }

  // Функция для обновления количества товара
  const handleUpdateStock = async () => {
    if (!selectedItem) return

    setIsUpdating(true)
    try {
      console.log(`Updating stock for expense ${selectedItem.id} to ${newStockValue}`)

      await expensesService.updateExpenseQuantity(Number(selectedItem.id), newStockValue)

      // Обновляем локальные данные
      setExpenses((prev) =>
        prev.map((item) => (item.id === selectedItem.id ? { ...item, quantity: newStockValue } : item)),
      )

      toast({
        title: "Количество обновлено",
        description: `Количество товара "${selectedItem.name}" изменено на ${newStockValue} шт.`,
      })

      setIsStockDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Error updating stock:", error)
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить количество товара",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Добавьте функцию удаления
  const handleDeleteExpense = async (item: ExpenseItem) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${item.name}" со склада?`)) {
      return
    }

    try {
      console.log(`Deleting expense ${item.id}`)

      await expensesService.deleteExpense(Number(item.id))

      // Удаляем из локальных данных
      setExpenses((prev) => prev.filter((expense) => expense.id !== item.id))

      toast({
        title: "Товар удален",
        description: `Товар "${item.name}" успешно удален со склада`,
      })
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить товар со склада",
        variant: "destructive",
      })
    }
  }

  // Определение колонок таблицы
  const columns: ColumnDef<ExpenseItem>[] = [
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push(`/expense/${item.product_id}`)}
              title="Просмотр"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteExpense(item)}
              title="Удалить"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Название
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category",
      header: "Категория",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "articleNumber",
      header: "Артикул",
      cell: ({ row }) => <div>{row.getValue("articleNumber")}</div>,
    },
    {
      accessorKey: "organization",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Организация
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("organization")}</div>,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            В наличии
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const quantity = Number.parseInt(row.getValue("quantity"))
        const item = row.original
        return (
          <Button
            variant="link"
            className={`p-0 h-auto ${quantity === 0 ? "text-red-500" : quantity < 10 ? "text-yellow-500" : ""}`}
            onClick={() => handleOpenStockDialog(item)}
          >
            {quantity} шт.
          </Button>
        )
      },
    },
  ]

  // Инициализация таблицы с помощью TanStack Table
  const table = useReactTable({
    data: expenses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  // Рендер таблицы с товарами
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input placeholder="Поиск по названию..." disabled className="max-w-sm" />
        </div>
        <div className="rounded-md border">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Поле поиска по названию товара и кнопка создания */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Поиск по названию..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        {/* Кнопка создания товара для поставщиков */}
        {user?.organizerRole === "supplier" && (
          <Link href="/products/create">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Создать товар
            </Button>
          </Link>
        )}
      </div>

      {/* Таблица с товарами */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Нет результатов.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} товаров</div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Назад
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Вперед
          </Button>
        </div>
      </div>
      {/* Модальное окно для редактирования количества товара */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Изменить количество товара</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedItem && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item-name" className="text-right">
                    Товар
                  </Label>
                  <div id="item-name" className="col-span-3 font-medium">
                    {selectedItem.name}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item-article" className="text-right">
                    Артикул
                  </Label>
                  <div id="item-article" className="col-span-3">
                    {selectedItem.articleNumber}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item-organization" className="text-right">
                    Организация
                  </Label>
                  <div id="item-organization" className="col-span-3">
                    {selectedItem.organization}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock-value" className="text-right">
                    Количество
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="stock-value"
                      type="number"
                      min="0"
                      value={newStockValue}
                      onChange={(e) => setNewStockValue(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateStock} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ExpenseTable() {
  return <ExpenseTableComponent />
}
