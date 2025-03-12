import type React from "react"
import { EquationProvider } from "@/context/equation-context"

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EquationProvider>{children}</EquationProvider>
}

