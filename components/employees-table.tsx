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
import { ArrowUpDown, MoreHorizontal, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { usersService } from "@/lib/api-services"
import type { UserCompanyWithUserInfo } from "@/lib/api-types"

export function EmployeesTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [employees, setEmployees] = React.useState<UserCompanyWithUserInfo[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false)
  const { toast } = useToast()

  // Загрузка сотрудников при монтировании компонента
  React.useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setIsLoading(true)
      console.log("Loading employees...")
      const response = await usersService.getCompanyUsers()
      console.log("Employees response:", response)
      setEmployees(response.users)
    } catch (error) {
      console.error("Error loading employees:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список сотрудников",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для удаления сотрудника
  const handleRemoveEmployee = async (userId: number, userName: string) => {
    if (confirm(`Вы уверены, что хотите удалить сотрудника "${userName}" из организации?`)) {
      try {
        console.log("Removing employee with ID:", userId)
        await usersService.removeUser(userId)

        // Обновляем локальный список
        setEmployees((prev) => prev.filter((employee) => employee.user_id !== userId))

        toast({
          title: "Успешно",
          description: `Сотрудник "${userName}" удален из организации`,
        })
      } catch (error) {
        console.error("Error removing employee:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось удалить сотрудника",
          variant: "destructive",
        })
      }
    }
  }

  // Функция для обновления списка после добавления нового сотрудника
  const handleEmployeeAdded = () => {
    setIsInviteDialogOpen(false)
    loadEmployees() // Перезагружаем список
    toast({
      title: "Успешно",
      description: "Приглашение отправлено",
    })
  }

  // Определение колонок таблицы
  const columns: ColumnDef<UserCompanyWithUserInfo>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            ФИО
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "role",
      header: "Должность",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        const roleText =
          role === "manager"
            ? "Менеджер"
            : role === "employee"
              ? "Сотрудник"
              : role === "admin"
                ? "Администратор"
                : role
        return <div>{roleText}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const employee = row.original

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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleRemoveEmployee(employee.user_id, employee.name)}
                className="text-destructive"
              >
                <UserX className="mr-2 h-4 w-4" />
                Удалить из организации
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: employees,
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
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-lg">Загрузка сотрудников...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Поиск по имени..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        {/* Удалена оранжевая кнопка для добавления сотрудника */}
      </div>

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
                  {employees.length === 0 ? "В организации пока нет сотрудников" : "Нет результатов."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} сотрудников
        </div>
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
