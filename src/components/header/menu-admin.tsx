"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MenuAdmin() {
    const params= useParams()

    const path= usePathname()
    if (path === "/admin") return null

    const slug= params.slug || ""

    const isAdmin= path.startsWith("/admin")

    return (
        <nav>
            <ul className="flex items-center">
                <li className={cn("flex items-center border-b-white hover:border-b-white hover:border-b-2 h-11 border-b-2 border-intraprop-color", path.endsWith("tablero") && "border-white")}>
                    <Link href={`/${slug}/tablero`}><Button className="text-base hover:bg-intraprop-color hover:text-white whitespace-nowrap" variant="ghost">Tablero {isAdmin && "Admin"}</Button></Link>
                </li>
                <li className={cn("flex items-center border-b-white hover:border-b-white hover:border-b-2 h-11 border-b-2 border-intraprop-color", path.endsWith("config") && "border-white", isAdmin && "hidden")}>
                    <Link href={`/${slug}/config`}><Button className="text-base hover:bg-intraprop-color hover:text-white" variant="ghost">Config</Button></Link>
                </li>
            </ul>
        </nav>
);
}
