"use client"

import { cn } from "@/lib/utils";
import { Clipboard, Home, LayoutDashboard, Music3, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const data= [
  {
    href: "/config",
    icon: LayoutDashboard,
    text: "Configuración"
  },
  {
    href: "divider", icon: User
  },
  {
    href: "/tablero",
    icon: Clipboard,
    text: "Tablero"
  },
  {
    href: "/config/properties",
    icon: Home,
    text: "Propiedades"
  },
  {
    href: "divider", icon: User
  },  
  {
    href: "/config/users",
    icon: User,
    text: "Usuarios"
  },
]


export default function SideBarInmobiliaria() {

  const path= usePathname()
  if (path.endsWith("tablero")) return null
  // on this path: /punta-real-state/admin, the slug is 
  const slug = path.split("/")[1]
  if (!slug) return null  

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
            <Link href={"/" + slug + href} key={href} className={classes}>
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
    </div>
  );
}


function divider() {
  return <div className="mx-2 my-5 border-b border-b-osom-color/50" />
}
