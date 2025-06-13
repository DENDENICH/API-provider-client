import type { Metadata } from "next"
import { CompanyRegistrationForm } from "@/components/company-registration-form"

export const metadata: Metadata = {
  title: "Регистрация компании",
  description: "Регистрация компании в системе управления поставками",
}

export default function CompanyRegistrationPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Регистрация компании</h1>
        <p className="text-sm text-muted-foreground">Введите данные вашей компании</p>
      </div>
      <CompanyRegistrationForm />
    </div>
  )
}
