import { ReactNode } from "react"
import Logo from "./logo"
import Logged from "./logged"
import getSession from "@/lib/auth"
import { ThemeToggle } from "../shadcn/theme-toggle"

interface Props {  
    children: ReactNode
}
  
export default async function Header({ children }: Props) {
    const session= await getSession()
    const nextURL= process.env.NEXTAUTH_URL || ""
    const env= nextURL.includes("localhost") ? "LOCALHOST" : nextURL.includes("osomserver.raphauy.dev") ? "PRE-PRODUCTION" : ""

    return (
        <div className="w-full">
            <div className="flex items-center gap-2">
                <div>
                    <Logo />
                </div>
                <div className="flex-1">                                
                    {session && children}
                </div>
                
                { env && <p className="font-bold border border-white rounded-md py-1 px-2 shadow-md shadow-white">{env}</p> }
                <div>
                    <ThemeToggle />
                </div>
                <div>
                    <Logged />
                </div>
            </div>
        </div>
    )
}
