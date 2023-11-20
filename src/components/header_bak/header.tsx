import { ReactNode } from "react"
import Logged from "./logged"
import Logo from "./logo"

interface Props {  
    children: ReactNode
}
  
export default async function Header({ children }: Props) {

    return (
        <div className="flex items-center gap-2 pb-1 border-b border-first-color/50">
            <div>
                <Logo />
            </div>

            <div className="flex-1">                                
                {children}
            </div>
            
            <div>
                <Logged />
            </div>
        </div>
    )
}
