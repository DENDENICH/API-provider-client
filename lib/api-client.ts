export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

class ApiClient {
  private token: string | null = null

  constructor() {
    // При создании экземпляра пытаемся восстановить токен из localStorage
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("access_token")
      if (storedToken) {
        this.token = storedToken
        console.log("Token restored in ApiClient constructor")
      }
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
    console.log("Token set in ApiClient:", token ? "exists" : "null")
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
    }
    console.log("Token cleared in ApiClient")
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
      console.log("Authorization header added to request")
    } else {
      console.warn("No token available for request")
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      // Для 204 No Content возвращаем пустой объект
      if (response.status === 204) {
        return {} as T
      }
      return response.json()
    }

    let errorMessage = "Произошла ошибка"
    let errorCode = "UNKNOWN_ERROR"
    let errorDetails: any = null

    try {
      const errorData = await response.json()
      errorDetails = errorData.details

      if (typeof errorData.details === "string") {
        errorMessage = errorData.details
      } else if (Array.isArray(errorData.details)) {
        errorMessage = errorData.details.join(", ")
      }
    } catch {
      // Если не удалось распарсить JSON, используем стандартные сообщения
    }

    switch (response.status) {
      case 400:
        if (response.url.includes("/auth/register")) {
          errorMessage = "Пользователь с таким email уже существует"
          errorCode = "USER_ALREADY_EXISTS"
        } else {
          errorMessage = errorMessage || "Неверные данные запроса"
          errorCode = "BAD_REQUEST"
        }
        break
      case 401:
        errorMessage = "Необходима авторизация"
        errorCode = "UNAUTHORIZED"
        this.clearToken()
        if (typeof window !== "undefined") {
          console.log("401 error, redirecting to login")
          window.location.href = "/login"
        }
        break
      case 403:
        errorMessage = "Недостаточно прав для выполнения операции"
        errorCode = "FORBIDDEN"
        break
      case 404:
        if (response.url.includes("/auth/login")) {
          errorMessage = "Пользователь с указанными данными не найден"
          errorCode = "USER_NOT_FOUND"
        } else {
          errorMessage = "Запрашиваемый ресурс не найден"
          errorCode = "NOT_FOUND"
        }
        break
      case 422:
        errorMessage = errorMessage || "Ошибка валидации данных"
        errorCode = "VALIDATION_ERROR"
        break
      case 500:
        errorMessage = "Внутренняя ошибка сервера"
        errorCode = "INTERNAL_SERVER_ERROR"
        break
      case 502:
        errorMessage = "Сервер временно недоступен"
        errorCode = "BAD_GATEWAY"
        break
      case 503:
        errorMessage = "Сервис временно недоступен"
        errorCode = "SERVICE_UNAVAILABLE"
        break
      default:
        if (response.status >= 500) {
          errorMessage = "Ошибка сервера. Попробуйте позже"
          errorCode = "SERVER_ERROR"
        }
    }

    throw new ApiClientError(errorMessage, response.status, errorCode, errorDetails)
  }

  async get<T>(url: string): Promise<T> {
    console.log("Making GET request to:", url)
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    })
    return this.handleResponse<T>(response)
  }

  async post<T>(url: string, data?: any): Promise<T> {
    console.log("Making POST request to:", url)
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async put<T>(url: string, data: any): Promise<T> {
    console.log("Making PUT request to:", url)
    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<T>(response)
  }

  async patch<T>(url: string, data: any): Promise<T> {
    console.log("Making PATCH request to:", url)
    const response = await fetch(url, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<T>(response)
  }

  async delete<T>(url: string): Promise<T> {
    console.log("Making DELETE request to:", url)
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    })
    return this.handleResponse<T>(response)
  }
}

export const apiClient = new ApiClient()
