import { JetBrains_Mono as FontMono, Inter as FontSans, Rubik, Nunito} from "next/font/google"

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const fontRubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  weight: "500",
})

export const fontNunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: "800",
})