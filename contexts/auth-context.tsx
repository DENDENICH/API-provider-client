"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService, organizersService } from "@/lib/api-services"
import { apiClient } from "@/lib/api-client"
import type {
  UserLoginRequest,
  UserRegisterRequest,
  OrganizerRegisterRequest,
  AuthResponseAfterRegister,
} from "@/lib/api-types"

export type OrganizerRole = "company" | "supplier" | "not_have_organizer"
export type UserRole = "admin" | "manager" | "employee"

interface User {
  id: string
  name: string
  email: string
  organizerRole: OrganizerRole
  userRole: UserRole
  organizationId?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: UserRegisterRequest) => Promise<AuthResponseAfterRegister>
  registerOrganization: (orgData: OrganizerRegisterRequest) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Проверка токена при загрузке приложения
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("access_token")
        const storedUser = localStorage.getItem("user")

        console.log("Initializing auth...")
        console.log("Token from localStorage:", token ? "exists" : "not found")
        console.log("User from localStorage:", storedUser ? "exists" : "not found")

        if (token && storedUser) {
          // Сначала устанавливаем токен в API клиент
          apiClient.setToken(token)
          console.log("Token set in API client")

          // Затем восстанавливаем пользователя
          const userData = JSON.parse(storedUser)
          setUser(userData)
          console.log("User restored:", userData)
        } else {
          console.log("No token or user found, clearing auth state")
          // Если нет токена или пользователя, очищаем все
          apiClient.clearToken()
          localStorage.removeItem("access_token")
          localStorage.removeItem("user")
          localStorage.removeItem("registered_email")
          localStorage.removeItem("registered_name")
        }
      } catch (error) {
        console.error("Ошибка при восстановлении пользователя:", error)
        // При ошибке очищаем все данные
        apiClient.clearToken()
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        localStorage.removeItem("registered_email")
        localStorage.removeItem("registered_name")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const loginData: UserLoginRequest = { email, password }
      const response = await authService.login(loginData)

      console.log("Login response:", response) // Для отладки

      // Сохраняем токен
      apiClient.setToken(response.access_token)

      // Создаем объект пользователя с новыми полями
      const newUser: User = {
        id: "user-1", // В реальном приложении это будет приходить с сервера
        name: email.split("@")[0],
        email,
        organizerRole: response.role_organizer,
        userRole: response.user_role as UserRole, // Исправлено: используем user_role вместо user_type
      }

      console.log("Created user object:", newUser) // Для отладки

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))

      // Если у пользователя нет организации, перенаправляем на страницу с кодом
      // if (response.role_organizer === "not_have_organizer") {
      //   throw new Error("NO_ORGANIZER")
      // }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: UserRegisterRequest): Promise<AuthResponseAfterRegister> => {
    setIsLoading(true)
    try {
      const response = await authService.register(userData)

      console.log("Register response:", response) // Для отладки

      // Сохраняем токен
      apiClient.setToken(response.access_token)

      // Сохраняем данные пользователя для последующего использования
      localStorage.setItem("registered_email", userData.email)
      localStorage.setItem("registered_name", userData.name)

      // Если НЕ нужна регистрация организации, создаем пользователя
      if (response.next_route !== "organizers/register") {
        const newUser: User = {
          id: "user-1",
          name: userData.name,
          email: userData.email,
          organizerRole: "not_have_organizer", // По умолчанию
          userRole: userData.user_type === "organizer" ? "admin" : "employee", // Определяем роль на основе типа пользователя
        }

        console.log("Created user object after register:", newUser) // Для отладки

        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
      }

      return response
    } finally {
      setIsLoading(false)
    }
  }

  const registerOrganization = async (orgData: OrganizerRegisterRequest) => {
    setIsLoading(true)
    try {
      console.log("registerOrganization called with:", orgData)
      console.log("Current user before update:", user)

      const response = await organizersService.register(orgData)
      console.log("organizersService.register response:", response)

      // Получаем актуальные данные пользователя
      const registeredEmail = localStorage.getItem("registered_email")
      const registeredName = localStorage.getItem("registered_name")

      // Обновляем роль пользователя
      if (user) {
        const updatedUser: User = {
          ...user,
          organizerRole: response.role as OrganizerRole,
          userRole: "admin" as UserRole, // При регистрации организации пользователь становится админом
        }

        console.log("Updated user object after org register:", updatedUser)

        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))

        console.log("User state updated and saved to localStorage")
      } else {
        console.error("No user found when trying to update after organization registration")

        // Если пользователя нет, создаем его на основе сохраненных данных
        if (registeredEmail && registeredName) {
          const newUser: User = {
            id: "user-1",
            name: registeredName,
            email: registeredEmail,
            organizerRole: orgData.role as OrganizerRole,
            userRole: "admin" as UserRole,
          }

          console.log("Created new user from registered data:", newUser)
          setUser(newUser)
          localStorage.setItem("user", JSON.stringify(newUser))
        } else {
          // Fallback к данным из localStorage
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser)
              const newUser: User = {
                ...userData,
                organizerRole: orgData.role as OrganizerRole,
                userRole: "admin" as UserRole,
              }

              console.log("Created new user from localStorage:", newUser)
              setUser(newUser)
              localStorage.setItem("user", JSON.stringify(newUser))
            } catch (error) {
              console.error("Error parsing stored user data:", error)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in registerOrganization:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    apiClient.clearToken()
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    localStorage.removeItem("registered_email")
    localStorage.removeItem("registered_name")
  }

  // Функция для проверки прав доступа
  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    // Проверка прав для разных ролей
    switch (permission) {
      case "manage_suppliers":
        // Только админы компании могут управлять поставщиками
        return user.organizerRole === "company" && user.userRole === "admin"

      case "add_employees":
        // Только админы могут добавлять сотрудников
        return user.userRole === "admin"

      case "view_suppliers":
        // Все сотрудники компании могут просматривать поставщиков
        return user.organizerRole === "company"

      case "view_employees":
        // Только админы могут просматривать сотрудников
        return user.userRole === "admin"

      default:
        return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        registerOrganization,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
