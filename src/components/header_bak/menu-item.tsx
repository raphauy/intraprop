"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { MenuType } from "./menu-data";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import React from "react";
  
interface Props {
    menu: MenuType[]
}

export default function MenuComponent({ menu }: Props) {

    const path= usePathname()
        

    return (
        <NavigationMenu>
            <NavigationMenuList>
            
            
            {                
                menu.map((item, index) => (
                    !item.subMenu ? simpleItem(item) :

                    <NavigationMenuItem key={index}>
                        <NavigationMenuTrigger><Link href={item.href}>{item.key}</Link></NavigationMenuTrigger>
                        {
                            <NavigationMenuContent>
                                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                {
                                    item.subMenu.map((subItem, subIndex) => (
                                        <ListItem key={subIndex} href={subItem.href} title={subItem.key}>
                                            {subItem.description}
                                        </ListItem>
                                    ))
                                }
                                </ul>
                            </NavigationMenuContent>

                        }
                    </NavigationMenuItem>                ))
            }
            </NavigationMenuList>

        </NavigationMenu>
    );
}

function simpleItem(menu: MenuType) {    
    return (
        <Link key={menu.key} href={menu.href}><Button variant="ghost">{menu.key}</Button></Link>
    )
}


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"