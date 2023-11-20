import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInmobiliariaDAOByslug } from "@/services/inmobiliaria-services"

type Props = {
    params: {
        slug: string
    }
}

export default async function InmobiliariaPage({ params }: Props) {

    const slug= params.slug
    if (!slug) return <div></div>
    
    const inmo= await getInmobiliariaDAOByslug(slug)
    if (!inmo) return <div></div>

    const celulares: string[]= inmo.celulares ? inmo.celulares.split(",") : []

    return (
        <div className="pt-10">
            {/* <Card>
                <CardHeader>
                    <CardTitle>{inmo.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p className="text-lg">{inmo.description}</p>
                    {
                        <ul>
                            {celulares.map((celular, index) => <li key={index}>{celular}</li>)}
                        </ul>
                    }
                </CardContent>
            </Card> */}

        </div>
    )
}
