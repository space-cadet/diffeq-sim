import { EquationInput } from "@/components/equation-input"
import { ParameterConfig } from "@/components/parameter-config"
import { InitialConditions } from "@/components/initial-conditions"
import { SolverSettings } from "@/components/solver-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export default function SimulatorPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Differential Equation Simulator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EquationInput />

          <Card>
            <CardHeader>
              <CardTitle>Solution Visualization</CardTitle>
              <CardDescription>The solution to your differential equation will appear here</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">Visualization will be implemented in Phase 3</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ParameterConfig />
          <InitialConditions />
          <SolverSettings />

          <Button className="w-full" size="lg">
            <Play className="mr-2 h-4 w-4" />
            Solve Equation
          </Button>
        </div>
      </div>
    </div>
  )
}

