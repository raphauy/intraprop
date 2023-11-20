
import { getCurrentUser } from "@/lib/auth";
import MenuAdmin from "./menu-admin";
import MenuComponent from "./menu-item";
import { publicMenu } from "./menu-data";
import Link from "next/link";
import { Sun } from "lucide-react";
import { ThemeToggle } from "../shadcn/theme-toggle";

export default async function Menu() {
    
    const user= await getCurrentUser()

    return (
        <div className="flex justify-between items-center">
            <div className="">
                {
                    user?.role === "admin" &&
                    <MenuAdmin />
                }                
            </div>
            
            <div>
                <MenuComponent menu={publicMenu} />
            </div>

            <div>
                <ThemeToggle />
            </div>
        </div>
    )
    
}
