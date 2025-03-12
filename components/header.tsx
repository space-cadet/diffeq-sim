import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">DiffEq Simulator</span>
          </Link>
          <MainNav />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="outline">Sign In</Button>
        </div>
      </div>
    </header>
  )
}

