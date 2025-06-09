import { apiClient } from "./api-client"
import { API_BASE_URL } from "./api-config"
import type {
  UserRegisterRequest,
  UserLoginRequest,
  AuthResponseAfterRegister,
  AuthResponseAfterLogin,
  OrganizerRegisterRequest,
  OrganizerResponse,
  ProductsResponse,
  ProductResponse,
  ProductRequest,
  SuppliesResponse,
  SupplyResponse,
  SupplyCreateRequest,
  SupplyStatusUpdate,
  SupplyAssembleCancelled,
  SuppliersResponse,
  SupplierResponse,
  UsersCompanyWithUserInfo,
  LinkCodeResponse,
  Expenses,
  Expense,
  StatisticCompany,
  StatisticSupplier,
} from "./api-types"

// Сервис для работы с аутентификацией
export const authService = {
  // Регистрация пользователя
  register: async (userData: UserRegisterRequest): Promise<AuthResponseAfterRegister> => {
    return apiClient.post<AuthResponseAfterRegister>(`${API_BASE_URL}/auth/register`, userData)
  },

  // Авторизация пользователя
  login: async (loginData: UserLoginRequest): Promise<AuthResponseAfterLogin> => {
    return apiClient.post<AuthResponseAfterLogin>(`${API_BASE_URL}/auth/login`, loginData)
  },
}

// Сервис для работы с организациями
export const organizersService = {
  // Регистрация организации
  register: async (orgData: OrganizerRegisterRequest): Promise<OrganizerResponse> => {
    return apiClient.post<OrganizerResponse>(`${API_BASE_URL}/organizers/register`, orgData)
  },
}

// Сервис для работы с пользователями
export const usersService = {
  // Получение всех сотрудников организации
  getCompanyUsers: async (): Promise<UsersCompanyWithUserInfo> => {
    return apiClient.get<UsersCompanyWithUserInfo>(`${API_BASE_URL}/users/company`)
  },

  // Привязка пользователя к организации
  addUserByLinkCode: async (linkCode: number, role: "manager" | "employee"): Promise<void> => {
    return apiClient.post<void>(`${API_BASE_URL}/users/company`, {
      link_code: linkCode,
      role,
    })
  },

  // Удаление пользователя из организации
  removeUser: async (userId: number): Promise<void> => {
    return apiClient.delete<void>(`${API_BASE_URL}/users/company?user_id=${userId}`)
  },

  // Получение кода привязки
  getLinkCode: async (): Promise<LinkCodeResponse> => {
    return apiClient.get<LinkCodeResponse>(`${API_BASE_URL}/linkcode`)
  },
}

// Сервис для работы с товарами
export const productsService = {
  // Получение списка товаров
  getProducts: async (supplierId?: number, addQuantity?: boolean): Promise<ProductsResponse> => {
    let url = `${API_BASE_URL}/products`
    const params = []

    if (supplierId) params.push(`supplier_id=${supplierId}`)
    if (addQuantity) params.push(`add_quantity=${addQuantity}`)

    if (params.length > 0) {
      url += `?${params.join("&")}`
    }

    return apiClient.get<ProductsResponse>(url)
  },

  // Получение информации о товаре
  getProduct: async (productId: number): Promise<ProductResponse> => {
    return apiClient.get<ProductResponse>(`${API_BASE_URL}/products/${productId}`)
  },

  // Добавление нового товара
  addProduct: async (productData: ProductRequest): Promise<void> => {
    return apiClient.post<void>(`${API_BASE_URL}/products`, productData)
  },

  // Обновление информации о товаре
  updateProduct: async (productId: number, productData: ProductResponse): Promise<ProductResponse> => {
    return apiClient.put<ProductResponse>(`${API_BASE_URL}/products/${productId}`, productData)
  },
}

// Сервис для работы с поставками
export const suppliesService = {
  // Получение списка поставок
  getSupplies: async (isWaitConfirm?: boolean, limit?: number): Promise<SuppliesResponse> => {
    let url = `${API_BASE_URL}/supplies`
    const params = []

    if (isWaitConfirm !== undefined) params.push(`is_wait_confirm=${isWaitConfirm}`)
    if (limit !== undefined) params.push(`limit=${limit}`)

    if (params.length > 0) {
      url += `?${params.join("&")}`
    }

    return apiClient.get<SuppliesResponse>(url)
  },

  // Получение информации о поставке по ID
  getSupply: async (supplyId: number): Promise<SupplyResponse> => {
    return apiClient.get<SupplyResponse>(`${API_BASE_URL}/supplies/${supplyId}`)
  },

  // Альтернативное название для совместимости
  getSupplyById: async (supplyId: number): Promise<SupplyResponse> => {
    return apiClient.get<SupplyResponse>(`${API_BASE_URL}/supplies/${supplyId}`)
  },

  // Создание новой поставки
  createSupply: async (supplyData: SupplyCreateRequest): Promise<SupplyResponse> => {
    return apiClient.post<SupplyResponse>(`${API_BASE_URL}/supplies`, supplyData)
  },

  // Принятие/отклонение поставки (PATCH /supplies/{supply_id})
  assembleOrCancelSupply: async (supplyId: number, data: SupplyAssembleCancelled): Promise<SupplyResponse> => {
    return apiClient.patch<SupplyResponse>(`${API_BASE_URL}/supplies/${supplyId}`, data)
  },

  // Изменение статуса поставки (PATCH /supplies/{supply_id}/status)
  updateSupplyStatus: async (supplyId: number, statusData: SupplyStatusUpdate): Promise<SupplyResponse> => {
    return apiClient.patch<SupplyResponse>(`${API_BASE_URL}/supplies/${supplyId}/status`, statusData)
  },
}

// Сервис для работы с поставщиками
export const suppliersService = {
  // Получение списка поставщиков
  getSuppliers: async (): Promise<SuppliersResponse> => {
    return apiClient.get<SuppliersResponse>(`${API_BASE_URL}/suppliers`)
  },

  // Получение поставщика по ИНН
  getSupplierByInn: async (inn: number): Promise<SupplierResponse> => {
    return apiClient.get<SupplierResponse>(`${API_BASE_URL}/suppliers/${inn}`)
  },

  // Добавление поставщика в контакты
  addSupplier: async (supplierId: number): Promise<void> => {
    return apiClient.post<void>(`${API_BASE_URL}/suppliers/${supplierId}`)
  },

  // Удаление поставщика из контактов
  removeSupplier: async (supplierId: number): Promise<OrganizerResponse> => {
    return apiClient.delete<OrganizerResponse>(`${API_BASE_URL}/suppliers/${supplierId}`)
  },
}

// Сервис для работы с расходами
export const expensesService = {
  // Получение всех расходов
  getExpenses: async (): Promise<Expenses> => {
    return apiClient.get<Expenses>(`${API_BASE_URL}/expenses/`)
  },

  // Обновление количества расхода
  updateExpenseQuantity: async (expenseId: number, quantity: number): Promise<Expense> => {
    return apiClient.patch<Expense>(`${API_BASE_URL}/expenses/${expenseId}/`, { quantity })
  },

  // Удаление расхода
  deleteExpense: async (expenseId: number): Promise<void> => {
    return apiClient.delete<void>(`${API_BASE_URL}/expenses/${expenseId}/`)
  },
}

// Сервис для работы со статистикой dashboard
export const dashboardService = {
  // Получение статистики для компании
  getCompanyStats: async (): Promise<StatisticCompany> => {
    return apiClient.get<StatisticCompany>(`${API_BASE_URL}/dashboard/company`)
  },

  // Получение статистики для поставщика
  getSupplierStats: async (): Promise<StatisticSupplier> => {
    return apiClient.get<StatisticSupplier>(`${API_BASE_URL}/dashboard/supplier`)
  },
}
