import type React from "react"
import type { Metadata } from "next"
import { Inter, Cinzel, Fondamento } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cinzel",
})
const fondamento = Fondamento({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fondamento",
})

export const metadata: Metadata = {
  title: "Solo Text RPG — Worldbuilder Edition",
  description: "A browser-based text RPG where you create your own world and adventure",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cinzel.variable} ${fondamento.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
