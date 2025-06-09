import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Wifi, Server, Lock, Search, AlertTriangle } from "lucide-react"
import { ApiClientError } from "@/lib/api-client"

interface ErrorAlertProps {
  error: Error | ApiClientError | null
  title?: string
  className?: string
}

export function ErrorAlert({ error, title = "Ошибка", className }: ErrorAlertProps) {
  if (!error) return null

  const getErrorIcon = (error: Error | ApiClientError) => {
    if (error instanceof ApiClientError) {
      switch (error.code) {
        case "UNAUTHORIZED":
        case "FORBIDDEN":
          return <Lock className="h-4 w-4" />
        case "NOT_FOUND":
          return <Search className="h-4 w-4" />
        case "NETWORK_ERROR":
          return <Wifi className="h-4 w-4" />
        case "SERVER_ERROR":
        case "INTERNAL_SERVER_ERROR":
        case "BAD_GATEWAY":
        case "SERVICE_UNAVAILABLE":
          return <Server className="h-4 w-4" />
        case "VALIDATION_ERROR":
        case "BAD_REQUEST":
          return <AlertTriangle className="h-4 w-4" />
        default:
          return <AlertCircle className="h-4 w-4" />
      }
    }
    return <AlertCircle className="h-4 w-4" />
  }

  const getErrorVariant = (error: Error | ApiClientError): "default" | "destructive" => {
    if (error instanceof ApiClientError) {
      switch (error.code) {
        case "VALIDATION_ERROR":
        case "BAD_REQUEST":
          return "default"
        default:
          return "destructive"
      }
    }
    return "destructive"
  }

  return (
    <Alert variant={getErrorVariant(error)} className={className}>
      {getErrorIcon(error)}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}
