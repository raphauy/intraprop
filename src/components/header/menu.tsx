
import { getCurrentUser } from "@/lib/auth";
import MenuAdmin from "./menu-admin";
import { InmoSelector, SelectorData } from "./inmo-selector";
import { getInmobiliariasDAO } from "@/services/inmobiliaria-services";
import { Separator } from "../ui/separator";
import MenuInmobiliarias from "./menu-inmobiliaria";

export default async function Menu() {
    
    const user= await getCurrentUser()

    if (!user) return <div></div>

    const inmobiliarias= await getInmobiliariasDAO()
    const selectorData: SelectorData[]= inmobiliarias.map(inmobiliaria => ({slug: inmobiliaria.slug, name: inmobiliaria.name}))

    if (user.role === "admin") 
        return (
            <div className="flex">
                <div className="flex items-center">
                    <p className="ml-1 text-2xl hidden sm:block">/</p>
                    <InmoSelector selectors={selectorData} />
                    <MenuAdmin />
                </div>
            </div>
        )

    return (
        <div className="flex items-center gap-3">
            <p className="text-2xl hidden sm:block">/</p>
            <p className="justify-between mr-2 font-bold text-lg whitespace-nowrap bg-intraprop-color ">
                Punta Real Estate
            </p>
            <MenuInmobiliarias />
        </div>

    );
}
