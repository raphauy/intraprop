import HookPedidos from "./hook-pedidos"


  
export default async function HooksPage() {

    const basePath= process.env.NEXTAUTH_URL || ""
    const hookPedidos= `${basePath}/api/pedidos`

    return (
        <div className="mt-10 text-center">
            <p className="text-2xl font-bold mb-10">Hook para ingreso de pedidos</p>
            <HookPedidos updateEndpoint={hookPedidos} />
            <p>Para la autenticación se utiliza el mismo API token <br /> que para el ingreso de propiedades</p>
        </div>
    )
}
