"use client"

import { cn } from "@/lib/utils";
import { Building, Clipboard, LayoutDashboard, Music3, PackageOpen, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const data= [
  {
    href: "/admin",
    icon: LayoutDashboard,
    text: "Dashboard"
  },
  {
    href: "divider", icon: User
  },
  {
    href: "/admin/inmobiliarias",
    icon: Building,
    text: "Inmobiliarias"
  },
  {
    href: "/admin/pedidos",
    icon: PackageOpen,
    text: "Pedidos"
  },
  {
    href: "/admin/tablero",
    icon: Clipboard,
    text: "Tablero Admin"
  },
  {
    href: "divider", icon: User
  },  
  {
    href: "/admin/hooks",
    icon: Music3,
    text: "Hook Pedidos"
  },
  {
    href: "divider", icon: User
  },  
  {
    href: "/admin/users",
    icon: User,
    text: "Usuarios"
  },
]


export default function SideBar() {

  const path= usePathname()
  if (path.endsWith("tablero")) return null

  const commonClasses= "flex gap-2 items-center py-1 mx-2 rounded hover:bg-gray-200 dark:hover:text-black"
  const selectedClasses= "font-bold text-osom-color dark:border-r-white"

  return (
    <div className="flex flex-col justify-between border-r border-r-osom-color/50">
      <section className="flex flex-col gap-3 py-4 mt-3 ">
        {data.map(({ href, icon: Icon, text }) => {
          if (href === "divider") return divider()
          
          const selected= path.endsWith(href)
          const classes= cn(commonClasses, selected && selectedClasses)
          return (
            <Link href={href} key={href} className={classes}>
              <Icon size={23} />
              <p className="hidden sm:block lg:w-36">{text}</p>                  
            </Link>
          )
        })}

        {/* <Link href="/admin" className={dashboard}>
          <LayoutDashboard size={23} />
          <p className={pClasses}>Dashboard</p>                  
        </Link> */}

        {divider()}



      </section>
      <section className="mb-4">
        {divider()}
        
        <p className="hidden sm:block lg:w-36 ml-3 font-bold">Versión 0.11.20</p>                  
      </section>
    </div>
  );
}


function divider() {
  return <div className="mx-2 my-5 border-b border-b-osom-color/50" />
}
