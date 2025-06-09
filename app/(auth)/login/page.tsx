import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Вход",
  description: "Вход в систему управления поставками",
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Вход в систему</h1>
        <p className="text-sm text-muted-foreground">Введите ваш email и пароль для входа</p>
      </div>
      <LoginForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/register" className="hover:text-brand underline underline-offset-4">
          Нет аккаунта? Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
