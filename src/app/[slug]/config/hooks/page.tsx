import { getInmobiliariaDAOByslug } from "@/services/inmobiliaria-services"
import Hook from "./hook"

type Props = {
    params: {
      slug: string
    }
}
  
export default async function HooksPage({ params }: Props) {

    const slug= params.slug
    const inmo= await getInmobiliariaDAOByslug(slug)
    const basePath= process.env.NEXTAUTH_URL || ""
    const updateEndpoint= `${basePath}/api/${inmo.id}/update`

    return (
        <div className="mt-10 text-center">
            <p className="text-2xl font-bold mb-10">Endpoints para {inmo.name}</p>
            <Hook updateEndpoint={updateEndpoint} />
        </div>
    )
}
