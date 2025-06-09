// Базовые типы
export interface ApiError {
  details: string | string[]
}

// Типы для аутентификации (НЕ ИЗМЕНЯЮТСЯ - уже в рабочем состоянии)
export interface UserRegisterRequest {
  name: string
  email: string
  phone: string
  password: string
  user_type: "organizer" | "employee"
}

export interface UserLoginRequest {
  email: string
  password: string
}

export interface AuthResponseAfterRegister {
  access_token: string
  type_token: string
  next_route: "organizers/register" | "/"
}

export interface AuthResponseAfterLogin {
  access_token: string
  type_token: string
  role_organizer: "company" | "supplier" | "not_have_organizer"
  user_type: "admin" | "manager" | "employee"
}

// Типы для пользователей
export interface UserCompanyWithUserInfo {
  name: string
  email: string
  phone: string
  role: string
  user_id: number
}

export interface UsersCompanyWithUserInfo {
  users: UserCompanyWithUserInfo[]
}

// Тип для кода привязки
export interface LinkCodeResponse {
  linkcode: number
}

// Типы для организаций (НЕ ИЗМЕНЯЮТСЯ - уже в рабочем состоянии)
export interface OrganizerRegisterRequest {
  name: string
  role: "company" | "supplier"
  address: string
  inn: string
  bank_details: string
}

export interface OrganizerResponse {
  id: number
  name: string
  role: "company" | "supplier"
  address: string
  inn: string
  bank_details: string
}

// Типы для товаров
export type ProductCategory =
  | "hair_coloring"
  | "hair_care"
  | "hair_styling"
  | "consumables"
  | "perming"
  | "eyebrows"
  | "manicure_and_pedicure"
  | "tools_and_equipment"

export interface ProductRequest {
  name: string
  category: ProductCategory
  price: number
  description: string
  quantity: number
}

export interface ProductUpdate {
  name: string
  category: ProductCategory
  price: number
  description: string
}

export interface ProductResponse {
  id: number
  article: number
  name: string
  category: string
  description: string
  price: number
  quantity?: number
  organizer_name: string
}

export interface ProductResponseSupply {
  id: number
  article: number
  name: string
  category: ProductCategory
  price: number
}

export interface ProductsResponse {
  products: ProductResponse[]
}

// Типы для поставок (ОБНОВЛЕНО)
export type SupplyStatus = "in_processing" | "assembled" | "in_delivery" | "adopted" | "delivered" | "cancelled"

export interface SupplyCreateRequest {
  supplier_id: number
  delivery_address: string
  total_price: number
  supply_products: Array<{
    product_id: number
    quantity: number
  }>
}

export interface SupplyAssembleCancelled {
  status: "cancelled" | "assembled"
}

export interface SupplyStatusUpdate {
  status: "assembled" | "in_delivery" | "adopted" | "delivered"
}

export interface SupplyResponse {
  id: number
  supplier: {
    id: number
    name: string
  }
  company: {
    id: number
    name: string
  }
  supply_products: Array<{
    product: ProductResponseSupply
    quantity: number
  }>
  article: number
  delivery_address: string
  total_price: number
  status: SupplyStatus
}

export interface SuppliesResponse {
  supplies: SupplyResponse[]
}

// Типы для поставщиков
export interface SupplierResponse {
  id: number
  name: string
  address: string
  inn: string
  role: "company" | "supplier"
  bank_details: string
}

export interface SuppliersResponse {
  organizers: SupplierResponse[]
}

// Типы для расходов склада
export type ExpenseCategory =
  | "hair_coloring"
  | "hair_care"
  | "hair_styling"
  | "consumables"
  | "perming"
  | "eyebrows_and_eyelashes"
  | "manicure_and_pedicure"
  | "tools_and_equipment"

export interface Expense {
  id: number
  product_id: number
  supplier_name: string
  article: number
  product_name: string
  category: ExpenseCategory
  description: string
  quantity: number
}

export interface Expenses {
  expenses: Expense[]
}

// Типы для запросов пользователей
export interface AddUserByLinkCodeRequest {
  link_code: number
  role: "manager" | "employee"
}

export interface UpdateExpenseQuantityRequest {
  quantity: number
}
