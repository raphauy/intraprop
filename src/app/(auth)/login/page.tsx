import { Metadata } from "next"

import getSession, { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserAuthForm } from "./user-auth-form"
import { getInmobiliariaDAO } from "@/services/inmobiliaria-services"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default async function AuthenticationPage() {
  const session= await getSession()
  const user= await getCurrentUser()
  const role= user?.role
  if (role === "admin")
    redirect("/admin/tablero")
  else if (role === "inmobiliaria") {
    if (!user?.inmobiliariaId) redirect("/unauthorized?message=No estas autorizado para acceder a esta página")

    const inmo= await getInmobiliariaDAO(user.inmobiliariaId)
    redirect(`/${inmo.slug}/tablero`)
  }    
  else if (role === "user")
    return redirect("/unauthorized?message=No estas autorizado para acceder a esta página. Debes pedir acceso a los administradores de Intraprop.")

    return (
      <div className="flex flex-col justify-center space-y-6 w-[380px] mt-10 bg-background text-muted-foreground p-1 rounded-xl">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Identificación de usuarios
          </h1>
        </div>
        <UserAuthForm />
      </div>
)
  }