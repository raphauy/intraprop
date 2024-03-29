import { Metadata } from "next"
import './globals.css'

import { Toaster } from "@/components/ui/toaster"

import { TailwindIndicator } from '@/components/shadcn/tailwind-indicator'
import { ThemeProvider } from '@/components/shadcn/theme-provider'
import getSession from '@/lib/auth'
import { fontSans } from '@/lib/fonts'
import { cn } from "@/lib/utils"
import Header from '../components/header/header'
import Menu from "@/components/header/menu"
import SessionProvider from '@/components/SessionProvider'


export const metadata: Metadata = {
  title: "Intraprop",
  description: "Intraprop es una herramienta para profesionales inmobiliarios. Su propósito es potenciar la conectividad entre colegas del rubro para conectar las necesidades de tus clientes y las oportunidades de otros colegas.",
  icons: {
    icon: "/favicon.ico",
  },  
}

interface RootLayoutProps {  
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session= await getSession()
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={cn("min-h-screen bg-background font-sans antialiased w-full", fontSans.variable)}>
            <SessionProvider session={session}>
          

            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="relative flex flex-col min-h-screen text-muted-foreground w-fit min-w-full">
                <div className="sm:px-1 md:px-2 xl:px-3 bg-intraprop-color text-white border-b border-b-white border-intraprop-color/50 w-full">
                  <Header><Menu /></Header> 
                </div>

                <div className="sm:px-1 md:px-2 xl:px-3 flex flex-col items-center flex-1 w-full">
                  {children}
                  <Toaster />
                  <p className="text-xs text-center py-3 text-gray-400">
                    Powered by {" "}
                    <a
                      href="https://www.osomdigital.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-black"
                    >            
                      Osom Digital
                    </a>
                  </p>
                </div>
              </div>            
              <TailwindIndicator />
            </ThemeProvider>

            </SessionProvider>
        </body>
      </html>
    </>
  )
}
