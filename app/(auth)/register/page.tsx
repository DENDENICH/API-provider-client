import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Регистрация в системе управления поставками",
}

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Создание аккаунта</h1>
        <p className="text-sm text-muted-foreground">Введите данные для регистрации</p>
      </div>
      <RegisterForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-brand underline underline-offset-4">
          Уже есть аккаунт? Войти
        </Link>
      </p>
    </div>
  )
}
