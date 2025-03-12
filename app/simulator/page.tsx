"use client"
import { EquationInput } from "@/components/equation-input"
import { ParameterConfig } from "@/components/parameter-config"
import { InitialConditions } from "@/components/initial-conditions"
import { SolverSettings } from "@/components/solver-settings"
import { SolutionPlot } from "@/components/solution-plot"
import { PhasePortrait } from "@/components/phase-portrait"
import { ExampleEquations } from "@/components/example-equations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw } from "lucide-react"
import { useEquationSolver } from "@/hooks/use-equation-solver"
import { useEquation } from "@/context/equation-context"

export default function SimulatorPage() {
  const { state, dispatch } = useEquation()
  const { solution, isComputing, error, solve } = useEquationSolver()

  const handleReset = () => {
    dispatch({ type: "RESET" })
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Differential Equation Simulator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EquationInput />

          <Card>
            <CardHeader>
              <CardTitle>Solution Visualization</CardTitle>
              <CardDescription>The solution to your differential equation</CardDescription>
            </CardHeader>
            <CardContent>
              <SolutionPlot solution={solution} isComputing={isComputing} error={error} />
            </CardContent>
          </Card>

          {state.variables.length >= 2 && solution && <PhasePortrait solution={solution} />}

          <ExampleEquations />
        </div>

        <div className="space-y-6">
          <ParameterConfig />
          <InitialConditions />
          <SolverSettings />

          <div className="flex gap-4">
            <Button className="flex-1" size="lg" onClick={solve} disabled={isComputing}>
              <Play className="mr-2 h-4 w-4" />
              Solve Equation
            </Button>

            <Button variant="outline" size="lg" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

