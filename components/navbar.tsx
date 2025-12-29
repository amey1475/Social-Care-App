"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, ImageIcon, Bot, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/chat", label: "Friends", icon: MessageSquare },
  { href: "/feed", label: "Photos", icon: ImageIcon },
  { href: "/ai", label: "Helper", icon: Bot },
]

export function Navbar() {
  const pathname = usePathname()

  if (pathname === "/login") return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-primary/10 px-4 pb-safe pt-2">
      <div className="max-w-screen-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70",
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-2xl transition-all",
                  isActive ? "bg-primary/10 scale-110" : "bg-transparent",
                )}
              >
                <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "opacity-100" : "opacity-70")}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
