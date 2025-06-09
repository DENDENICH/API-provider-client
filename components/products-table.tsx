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
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { productsService } from "@/lib/api-services"
import type { ProductResponse } from "@/lib/api-types"
import { useToast } from "@/hooks/use-toast"

// Определение колонок
export const columns: ColumnDef<ProductResponse>[] = [
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
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      // Преобразуем категории из API в читаемый вид
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
      return <div>{categoryMap[category] || category}</div>
    },
  },
  {
    accessorKey: "article",
    header: "Артикул",
    cell: ({ row }) => <div>{row.getValue("article")}</div>,
  },
  {
    accessorKey: "organizer_name",
    header: "Поставщик",
    cell: ({ row }) => <div>{row.getValue("organizer_name")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Цена
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = Number.parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
      }).format(price)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "quantity",
    header: "В наличии",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number | null
      if (quantity === null || quantity === undefined) {
        return <div className="text-muted-foreground">—</div>
      }
      return (
        <div className={`font-medium ${quantity === 0 ? "text-red-500" : quantity < 10 ? "text-yellow-500" : ""}`}>
          {quantity} шт.
        </div>
      )
    },
  },
]

export function ProductsTable() {
  const { toast } = useToast()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Состояние для данных
  const [products, setProducts] = React.useState<ProductResponse[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Загрузка товаров при монтировании компонента
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching products from API...")

        const response = await productsService.getProducts(undefined, true) // addQuantity = true для получения количества
        console.log("Products API response:", response)

        setProducts(response.products)

        toast({
          title: "Товары загружены",
          description: `Загружено ${response.products.length} товаров`,
        })
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список товаров",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [toast])

  const table = useReactTable({
    data: products,
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
      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск по названию..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
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
    </div>
  )
}
