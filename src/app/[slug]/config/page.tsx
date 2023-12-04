import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTotalCoincidencesByInmo, getTotalCoincidencesWithNotificationByInmo } from "@/services/coincidence-services";
import { getInmobiliariaDAOByslug, getTotalProperiesByInmobiliaria } from "@/services/inmobiliaria-services";
import { getPedidosDAO } from "@/services/pedido-services";
import { getPropertiesOfInmobiliaria } from "@/services/property-services";
import { getUsersDAOBySlug } from "@/services/user-services";
import { Home, PackageOpen, User } from "lucide-react";
import Link from "next/link";

type Props = {
  params: {
    slug: string
  }
}

export default async function AdminPage({ params }: Props) {
  const slug= params.slug

  const inmo= await getInmobiliariaDAOByslug(slug)
  const pedidos= await getPedidosDAO("ALL")
  const totalCoincidences= await getTotalCoincidencesByInmo(inmo.id)
  const totalNotifications= await getTotalCoincidencesWithNotificationByInmo(inmo.id)
  const users= await getUsersDAOBySlug(slug)
  
  const properties= await getPropertiesOfInmobiliaria(inmo.id)
  const totalProperties= properties.length
  const totalCasas= properties.filter((property) => property.tipo === "Casa").length
  const totalApartamentos= properties.filter((property) => property.tipo === "Apartamento").length

  return (
    <div className="flex flex-col">
      <p className="mt-10 mb-5 text-3xl font-bold text-center">{inmo.name}</p>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col items-center">
          <Link href={`/${slug}/config/properties`}>
            <Card className="w-64">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
                <Home className="text-gray-500" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProperties}</div>
                <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">
                      {totalCasas} casas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totalApartamentos} apartamentos
                    </p>
                </div>
                <div className="flex justify-between">
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <Card className="w-64">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <PackageOpen className="text-gray-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidos.length}</div>
              <div className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  {totalCoincidences} coincidencias
                </p>                  
                <p className="text-xs text-muted-foreground">
                  {totalNotifications} 💚
                </p>                  
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col items-center h-full">
          <Link href={`/${slug}/config/users`} className="h-full">
            <Card className="w-64 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                <User className="text-gray-500" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
