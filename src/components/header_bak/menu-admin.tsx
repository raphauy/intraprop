"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import { usePathname } from "next/navigation";

export default function MenuAdmin() {

    const path= usePathname()

    return (
        <div className="flex flex-1 gap-6 pl-5 md:gap-5 ">
            <nav>
                <ul className="flex items-center">
                    <li className={`flex items-center border-b-first-color hover:border-b-first-color hover:border-b-2 h-11 ${path.includes("admin") && "border-b-2"}`}>
                        <Link href="/admin"><Button className="text-lg" variant="ghost">Admin</Button></Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
