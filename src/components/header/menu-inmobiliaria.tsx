"use client"

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function MenuInmobiliarias() {
    const params= useParams()
    const path= usePathname()
    if (path.startsWith("/admin")) return null

    const slug= params.slug

    return (
        <div className="flex items-center">
            <p className={cn("ml-1 text-2xl hidden sm:block", path.startsWith("admin") && "hidden")}>/</p>
            <nav>
                <ul className="flex items-center">
                    <li className={cn("flex items-center border-b-white hover:border-b-white hover:border-b-2 h-11 border-b-2 border-intraprop-color", path.endsWith("tablero") && "border-white")}>
                        <Link href={`/${slug}/tablero`}><Button className="text-base hover:bg-intraprop-color hover:text-white whitespace-nowrap" variant="ghost">Tablero</Button></Link>
                    </li>
                    <li className={cn("flex items-center border-b-white hover:border-b-white hover:border-b-2 h-11 border-b-2 border-intraprop-color", path.endsWith("properties") && "border-white")}>
                        <Link href={`/${slug}/config/properties`}><Button className="text-base hover:bg-intraprop-color hover:text-white" variant="ghost">Propiedades</Button></Link>
                    </li>
                </ul>
            </nav>

        </div>
    );
}
