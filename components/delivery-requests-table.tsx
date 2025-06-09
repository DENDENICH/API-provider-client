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
import { ArrowUpDown, ChevronDown, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { suppliesService } from "@/lib/api-services"
import type { SupplyResponse } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

// Функция для отображения статуса запроса
function getStatusBadge(status: SupplyResponse["status"]) {
  switch (status) {
    case "in_processing":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          В обработке
        </Badge>
      )
    case "assembled":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Собран
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          Отменен
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          {status || "Неизвестно"}
        </Badge>
      )
  }
}

export function DeliveryRequestsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [requests, setRequests] = React.useState<SupplyResponse[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Загрузка запросов на поставку из API
  const fetchRequests = React.useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("Fetching delivery requests from API...")

      // Для запросов на поставку получаем поставки, ожидающие подтверждения (is_wait_confirm = true)
      const response = await suppliesService.getSupplies(true)

      console.log("Delivery requests API response:", response)
      setRequests(response.supplies || [])
    } catch (error) {
      console.error("Error fetching delivery requests:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить запросы на поставку",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // Функция для принятия запроса на поставку (PATCH /supplies/{supply_id})
  const handleAccept = async (id: number) => {
    try {
      // Используем assembleOrCancelSupply для принятия запроса (assembled)
      await suppliesService.assembleOrCancelSupply(id, { status: "assembled" })

      // Обновление UI после успешного принятия
      setRequests((prev) =>
        prev.map((request) => {
          if (request.id === id) {
            return { ...request, status: "assembled" as const }
          }
          return request
        }),
      )

      toast({
        title: "Успех",
        description: `Запрос #${id} принят. Поставка собирается.`,
      })
    } catch (error) {
      console.error("Error accepting request:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось принять запрос на поставку",
        variant: "destructive",
      })
    }
  }

  // Функция для отклонения запроса на поставку (PATCH /supplies/{supply_id})
  const handleReject = async (id: number) => {
    try {
      // Используем assembleOrCancelSupply для отклонения запроса (cancelled)
      await suppliesService.assembleOrCancelSupply(id, { status: "cancelled" })

      // Обновление UI после успешного отклонения
      setRequests((prev) =>
        prev.map((request) => {
          if (request.id === id) {
            return { ...request, status: "cancelled" as const }
          }
          return request
        }),
      )

      toast({
        title: "Успех",
        description: `Запрос #${id} отклонен.`,
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось отклонить запрос на поставку",
        variant: "destructive",
      })
    }
  }

  // Функция для просмотра запроса на поставку
  const handleViewDelivery = (id: number) => {
    // Находим поставку в текущем массиве requests
    const delivery = requests.find((req) => req.id === id)

    if (!delivery) {
      toast({
        title: "Ошибка",
        description: "Поставка не найдена",
        variant: "destructive",
      })
      return
    }

    // Сохраняем данные поставки в localStorage для передачи на страницу просмотра
    localStorage.setItem(`delivery_${id}`, JSON.stringify(delivery))

    // Переходим на страницу просмотра поставки
    router.push(`/deliveries/${id}`)
  }

  // Определение колонок таблицы
  const columns: ColumnDef<SupplyResponse>[] = [
    // Колонка с номером запроса
    {
      accessorKey: "article",
      header: "Номер",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("article")}</div>,
    },
    // Колонка с заказчиком
    {
      accessorKey: "company",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Заказчик
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const company = row.getValue("company") as SupplyResponse["company"]
        return <div>{company.name}</div>
      },
    },
    {
      accessorKey: "delivery_address",
      header: "Адрес доставки",
      cell: ({ row }) => {
        const address = row.getValue("delivery_address") as string
        return (
          <div className="max-w-[200px] truncate" title={address}>
            {address}
          </div>
        )
      },
    },
    {
      accessorKey: "supply_products",
      header: "Товары",
      cell: ({ row }) => {
        const products = row.getValue("supply_products") as SupplyResponse["supply_products"]
        const productText = products.map((p) => `${p.product.name} (${p.quantity} шт.)`).join(", ")
        return (
          <div className="max-w-[200px] truncate" title={productText}>
            {productText}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "total_price",
      header: "Сумма",
      cell: ({ row }) => {
        const amount = row.getValue("total_price") as number
        return <div className="font-medium">{amount.toFixed(2)} ₽</div>
      },
    },

    // Колонка с действиями
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const request = row.original

        return (
          <div className="flex items-center gap-2">
            {/* Кнопка просмотра запроса */}
            <Button variant="outline" size="sm" onClick={() => handleViewDelivery(request.id)} className="h-8">
              Просмотр
            </Button>
            {/* Кнопки принятия и отклонения запроса (только для запросов в статусе "in_processing") */}
            {request.status === "in_processing" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAccept(request.id)}
                  className="h-8 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
                >
                  <Check className="h-4 w-4 mr-1" /> Принять
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(request.id)}
                  className="h-8 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
                >
                  <X className="h-4 w-4 mr-1" /> Отклонить
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  // Инициализация таблицы с помощью TanStack Table
  const table = useReactTable({
    data: requests,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="text-lg font-medium">Загрузка запросов на поставку...</div>
            <div className="text-sm text-muted-foreground mt-2">Пожалуйста, подождите</div>
          </div>
        </div>
      </div>
    )
  }

  // Рендер таблицы с запросами на поставку
  return (
    <div className="w-full">
      {/* Поле поиска по номеру запроса и выбор отображаемых колонок */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск по номеру..."
          value={(table.getColumn("article")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("article")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Колонки <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "article"
                      ? "Номер"
                      : column.id === "company"
                        ? "Заказчик"
                        : column.id === "delivery_address"
                          ? "Адрес доставки"
                          : column.id === "supply_products"
                            ? "Товары"
                            : column.id === "status"
                              ? "Статус"
                              : column.id === "total_price"
                                ? "Сумма"
                                : column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Таблица с запросами на поставку */}
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
        <div className="flex-1 text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} запросов</div>
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
    </div>
  )
}
