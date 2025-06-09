// Экспортируем константу API_BASE_URL
export const API_BASE_URL = "http://localhost:7654"

export const API_ENDPOINTS = {
  // Аутентификация
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,

  // Пользователи
  USERS_COMPANY: `${API_BASE_URL}/users/company`,
  LINK_CODE: `${API_BASE_URL}/linkcode`,

  // Организации
  ORGANIZERS_REGISTER: `${API_BASE_URL}/organizers/register`,

  // Товары
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_BY_ID: (id: number) => `${API_BASE_URL}/products/${id}`,

  // Поставки
  SUPPLIES: `${API_BASE_URL}/supplies`,
  SUPPLY_BY_ID: (id: number) => `${API_BASE_URL}/supplies/${id}`,
  SUPPLY_STATUS: (id: number) => `${API_BASE_URL}/supplies/${id}/status`,

  // Поставщики
  SUPPLIERS: `${API_BASE_URL}/suppliers`,
  SUPPLIER_BY_INN: (inn: number) => `${API_BASE_URL}/suppliers/${inn}`,
  SUPPLIER_BY_ID: (id: number) => `${API_BASE_URL}/suppliers/${id}`,

  // Расходы склада
  EXPENSES: `${API_BASE_URL}/expenses/`,
  EXPENSE_BY_ID: (id: number) => `${API_BASE_URL}/expenses/${id}/`,
} as const
