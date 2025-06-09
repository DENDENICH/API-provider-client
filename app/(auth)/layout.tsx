import type React from "react"
interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">{children}</div>
}
