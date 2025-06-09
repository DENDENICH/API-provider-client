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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
// Удалите эти строки:
// import jsPDF from "jspdf"
// import { font } from "./fonts/PTSans-Regular-normal"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Checkbox } from "@/components/ui/checkbox"
import { suppliesService } from "@/lib/api-services"
import type { SupplyResponse } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

// Функция для отображения статуса
function StatusBadge({
  status,
  onStatusChange,
}: {
  status: SupplyResponse["status"]
  onStatusChange?: (newStatus: SupplyResponse["status"]) => void
}) {
  let badgeContent
  let badgeClass

  switch (status) {
    case "in_processing":
      badgeContent = "В обработке"
      badgeClass = "bg-purple-100 text-purple-800 hover:bg-purple-100"
      break
    case "assembled":
      badgeContent = "Собран"
      badgeClass = "bg-blue-100 text-blue-800 hover:bg-blue-100"
      break
    case "in_delivery":
      badgeContent = "В доставке"
      badgeClass = "bg-orange-100 text-orange-800 hover:bg-orange-100"
      break
    case "delivered":
      badgeContent = "Доставлен"
      badgeClass = "bg-green-100 text-green-800 hover:bg-green-100"
      break
    case "adopted":
      badgeContent = "Принят"
      badgeClass = "bg-green-500 text-white hover:bg-green-600"
      break
    case "cancelled":
      badgeContent = "Отменен"
      badgeClass = "bg-red-100 text-red-800 hover:bg-red-100"
      break
    default:
      badgeContent = status || "Неизвестно"
      badgeClass = "bg-gray-100 text-gray-800 hover:bg-gray-100"
      break
  }

  if (onStatusChange) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge variant="outline" className={`cursor-pointer ${badgeClass}`}>
            {badgeContent}
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Изменить статус</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onStatusChange("assembled")}>Собран</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange("in_delivery")}>В доставке</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange("delivered")}>Доставлен</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange("adopted")}>Принят</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Badge variant="outline" className={badgeClass}>
      {badgeContent}
    </Badge>
  )
}

export function DeliveriesTable() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [deliveries, setDeliveries] = React.useState<SupplyResponse[]>([])
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Загрузка поставок из API
  const fetchDeliveries = React.useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("Fetching deliveries from API...")

      let response
      if (user?.organizerRole === "supplier") {
        // Для поставщиков получаем подтвержденные поставки (is_wait_confirm = false)
        response = await suppliesService.getSupplies(false)
      } else {
        // Для компаний получаем все поставки без параметра
        response = await suppliesService.getSupplies()
      }

      console.log("Deliveries API response:", response)
      setDeliveries(response.supplies || [])
    } catch (error) {
      console.error("Error fetching deliveries:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить поставки",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, user?.organizerRole])

  React.useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  // Функция для обработки выбора всех строк
  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = deliveries
          .filter((delivery) => delivery.id != null && delivery.id !== 0)
          .map((delivery) => String(delivery.id))
        setSelectedRows(allIds)
      } else {
        setSelectedRows([])
      }
    },
    [deliveries],
  )

  // Функция для обработки выбора отдельной строки
  const handleSelectRow = React.useCallback((id: string, checked: boolean) => {
    setSelectedRows((prev) => {
      if (checked) {
        return [...prev, id]
      } else {
        return prev.filter((rowId) => rowId !== id)
      }
    })
  }, [])

  // Функция для скачивания накладной в PDF формате
  const handleDownloadInvoice = () => {
    if (selectedRows.length === 0) {
      toast({
        title: "Предупреждение",
        description: "Пожалуйста, выберите хотя бы одну поставку для формирования накладной",
        variant: "destructive",
      })
      return
    }

    const selectedDeliveries = deliveries.filter(
      (delivery) => delivery.id != null && selectedRows.includes(String(delivery.id)),
    )

    try {
      // Создаем HTML-контент для накладной
      const currentDate = new Date().toLocaleDateString("ru-RU")
      const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)}`
      const totalAmount = selectedDeliveries.reduce((sum, delivery) => sum + delivery.total_price, 0)

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Накладная ${invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
          }
          .info {
            margin-bottom: 20px;
          }
          .delivery-item {
            margin-bottom: 20px;
            padding: 10px;
            border-left: 3px solid #ccc;
          }
          .delivery-title {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .delivery-details {
            margin-left: 15px;
          }
          .total {
            font-size: 16px;
            font-weight: bold;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
          .signature {
            margin-top: 50px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">НАКЛАДНАЯ</div>
        
        <div class="info">
          <div><strong>Дата:</strong> ${currentDate}</div>
          <div><strong>Номер:</strong> ${invoiceNumber}</div>
        </div>
        
        <div style="font-size: 18px; font-weight: bold; margin: 20px 0;">Список поставок:</div>
        
        ${selectedDeliveries
          .map(
            (delivery, index) => `
          <div class="delivery-item">
            <div class="delivery-title">${index + 1}. Поставка #${delivery.article}</div>
            <div class="delivery-details">
              <div><strong>Поставщик:</strong> ${delivery.supplier.name}</div>
              <div><strong>Адрес доставки:</strong> ${delivery.delivery_address}</div>
              <div><strong>Товары:</strong> ${delivery.supply_products.map((p) => `${p.product.name} (${p.quantity} шт.)`).join(", ")}</div>
              <div><strong>Сумма:</strong> ${delivery.total_price.toFixed(2)} ₽</div>
            </div>
          </div>
        `,
          )
          .join("")}
        
        <div class="total">
          Общая сумма: ${totalAmount.toFixed(2)} ₽
        </div>
        
        <div class="signature">
          Подпись: ___________________
        </div>
      </body>
      </html>
    `

      // Создаем новое окно для печати
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()

        // Ждем загрузки контента и запускаем печать
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            // Закрываем окно после печати (опционально)
            printWindow.onafterprint = () => {
              printWindow.close()
            }
          }, 500)
        }

        toast({
          title: "Успех",
          description: "Накладная открыта для печати. Вы можете сохранить её как PDF через диалог печати.",
        })
      } else {
        throw new Error("Не удалось открыть окно печати")
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сформировать накладную",
        variant: "destructive",
      })
    }
  }

  // Функция для изменения статуса поставки (PATCH /supplies/{supply_id}/status)
  const handleStatusChange = async (id: number, newStatus: SupplyResponse["status"]) => {
    try {
      await suppliesService.updateSupplyStatus(id, { status: newStatus })

      // Обновляем локальное состояние
      setDeliveries((prev) =>
        prev.map((delivery) => {
          if (delivery.id === id) {
            return { ...delivery, status: newStatus }
          }
          return delivery
        }),
      )

      toast({
        title: "Успех",
        description: `Статус поставки #${id} изменен на "${newStatus}"`,
      })
    } catch (error) {
      console.error("Error updating supply status:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус поставки",
        variant: "destructive",
      })
    }
  }

  // Функция для просмотра детальной информации о поставке
  const handleViewDelivery = (deliveryId: number) => {
    try {
      console.log(`Viewing delivery with ID: ${deliveryId}`)

      if (!deliveryId || deliveryId === 0) {
        toast({
          title: "Ошибка",
          description: "Некорректный ID поставки",
          variant: "destructive",
        })
        return
      }

      // Находим поставку в текущем массиве
      const delivery = deliveries.find((d) => d.id === deliveryId)

      if (!delivery) {
        toast({
          title: "Ошибка",
          description: "Поставка не найдена",
          variant: "destructive",
        })
        return
      }

      console.log("Found delivery data:", delivery)

      // Сохраняем данные поставки в localStorage для передачи на страницу просмотра
      localStorage.setItem(`delivery_${deliveryId}`, JSON.stringify(delivery))

      // Перенаправляем на страницу просмотра
      router.push(`/deliveries/${deliveryId}`)
    } catch (error) {
      console.error("Error viewing delivery:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось открыть детальную информацию о поставке",
        variant: "destructive",
      })
    }
  }

  // Определение колонок таблицы
  const columns: ColumnDef<SupplyResponse>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const validDeliveries = deliveries.filter((d) => d.id != null && d.id !== 0)
          return (
            <Checkbox
              checked={
                validDeliveries.length > 0 && selectedRows.length > 0 && selectedRows.length === validDeliveries.length
              }
              onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              aria-label="Выбрать все"
            />
          )
        },
        cell: ({ row }) => {
          const deliveryId = row.original.id
          if (deliveryId == null || deliveryId === 0) return null

          return (
            <Checkbox
              checked={selectedRows.includes(String(deliveryId))}
              onCheckedChange={(checked) => handleSelectRow(String(deliveryId), checked as boolean)}
              aria-label="Выбрать строку"
            />
          )
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "article",
        header: "Номер",
        cell: ({ row }) => <div className="font-medium">#{row.getValue("article")}</div>,
      },
      // Показывать колонку "Поставщик" только для роли "company"
      ...(user?.organizerRole === "company"
        ? [
            {
              accessorKey: "supplier",
              header: ({ column }) => {
                return (
                  <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Поставщик
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                )
              },
              cell: ({ row }) => {
                const supplier = row.getValue("supplier") as SupplyResponse["supplier"]
                return <div>{supplier.name}</div>
              },
            } as ColumnDef<SupplyResponse>,
          ]
        : []),
      {
        accessorKey: "delivery_address",
        header: "Адрес доставки",
        cell: ({ row }) => {
          const address = row.getValue("delivery_address") as string
          return (
            <div className="max-w-[150px] truncate" title={address}>
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
        cell: ({ row }) => {
          const delivery = row.original
          return (
            <StatusBadge
              status={delivery.status}
              onStatusChange={
                user?.organizerRole === "supplier"
                  ? (newStatus) => handleStatusChange(delivery.id, newStatus)
                  : undefined
              }
            />
          )
        },
      },
      // Показывать колонку "Заказчик" только для роли "supplier"
      ...(user?.organizerRole === "supplier"
        ? [
            {
              accessorKey: "company",
              header: "Заказчик",
              cell: ({ row }) => {
                const company = row.getValue("company") as SupplyResponse["company"]
                return <div>{company.name}</div>
              },
            } as ColumnDef<SupplyResponse>,
          ]
        : []),
      {
        accessorKey: "total_price",
        header: "Сумма",
        cell: ({ row }) => {
          const amount = row.getValue("total_price") as number
          return <div className="font-medium">{amount.toFixed(2)} ₽</div>
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const delivery = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Открыть меню</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleViewDelivery(delivery.id)}
                  disabled={!delivery.id || delivery.id === 0}
                >
                  Просмотр
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [user?.organizerRole, selectedRows, deliveries, handleSelectAll, handleSelectRow],
  )

  const table = useReactTable({
    data: deliveries,
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
            <div className="text-lg font-medium">Загрузка поставок...</div>
            <div className="text-sm text-muted-foreground mt-2">Пожалуйста, подождите</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск по номеру..."
          value={(table.getColumn("article")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("article")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <div className="ml-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const validDeliveries = deliveries.filter((d) => d.id != null && d.id !== 0)
              const shouldSelectAll = selectedRows.length !== validDeliveries.length || selectedRows.length === 0
              handleSelectAll(shouldSelectAll)
            }}
          >
            {selectedRows.length > 0 &&
            selectedRows.length === deliveries.filter((d) => d.id != null && d.id !== 0).length
              ? "Снять выбор"
              : "Выбрать все"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedRows.length > 0 ? `Выбрано: ${selectedRows.length}` : ""}
          </span>
        </div>

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
                      : column.id === "supplier"
                        ? "Поставщик"
                        : column.id === "delivery_address"
                          ? "Адрес доставки"
                          : column.id === "supply_products"
                            ? "Товары"
                            : column.id === "status"
                              ? "Статус"
                              : column.id === "company"
                                ? "Заказчик"
                                : column.id === "total_price"
                                  ? "Сумма"
                                  : column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" className="ml-2" onClick={handleDownloadInvoice}>
          Сформировать накладную
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} поставок</div>
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
