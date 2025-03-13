"use client"

import { useEffect } from "react"
import { EnhancedEquationInput } from "@/components/enhanced-equation-input"
import { EquationAnalysis } from "@/components/equation-analysis"
import { ParameterConfig } from "@/components/parameter-config"
import { InitialConditions } from "@/components/initial-conditions"
import { SolverSettings } from "@/components/solver-settings"
import { MethodSelector } from "@/components/method-selector"
import { EnhancedSolutionPlot } from "@/components/enhanced-solution-plot"
import { ExampleEquations } from "@/components/example-equations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw } from "lucide-react"
import { useEquationSolver } from "@/hooks/use-equation-solver"
import { useEquation } from "@/context/equation-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SimulatorPage() {
  const { state, dispatch } = useEquation()
  const { solution, isComputing, error, solve } = useEquationSolver()

  const handleReset = () => {
    dispatch({ type: "RESET" })
  }

  // Load example from localStorage if available
  useEffect(() => {
    const storedExample = localStorage.getItem("selectedExample")
    if (storedExample) {
      try {
        const example = JSON.parse(storedExample)

        // Reset state
        dispatch({ type: "RESET" })

        // Set equation
        dispatch({ type: "SET_EQUATION", payload: example.equation })

        // Set variables
        example.variables.forEach((variable: string) => {
          dispatch({
            type: "ADD_VARIABLE",
            payload: { name: variable },
          })
        })

        // Set parameters
        example.parameters.forEach((param: { name: string; value: number }) => {
          dispatch({
            type: "ADD_PARAMETER",
            payload: {
              name: param.name,
              value: param.value,
              min: -10,
              max: 10,
              step: 0.1,
            },
          })
        })

        // Set initial conditions
        example.initialConditions.forEach((ic: { variable: string; value: number; order: number }) => {
          dispatch({
            type: "SET_INITIAL_CONDITION",
            payload: {
              variable: ic.variable,
              value: ic.value,
              order: ic.order,
            },
          })
        })

        // Update the equation input field
        const event = new CustomEvent("update-equation-input", {
          detail: { equation: example.equation },
        })
        window.dispatchEvent(event)

        // Clear localStorage to prevent reloading on refresh
        localStorage.removeItem("selectedExample")
      } catch (error) {
        console.error("Error loading example:", error)
      }
    }
  }, [dispatch])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Differential Equation Simulator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EnhancedEquationInput />

          <Card>
            <CardHeader>
              <CardTitle>Solution Visualization</CardTitle>
              <CardDescription>The solution to your differential equation</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedSolutionPlot solution={solution} isComputing={isComputing} error={error} />
            </CardContent>
          </Card>

          <Tabs defaultValue="examples">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="examples">Example Equations</TabsTrigger>
              <TabsTrigger value="analysis">Equation Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="examples">
              <ExampleEquations />
            </TabsContent>
            <TabsContent value="analysis">
              <EquationAnalysis />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="parameters">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="initial">Initial Conditions</TabsTrigger>
              <TabsTrigger value="solver">Solver</TabsTrigger>
            </TabsList>
            <TabsContent value="parameters">
              <ParameterConfig />
            </TabsContent>
            <TabsContent value="initial">
              <InitialConditions />
            </TabsContent>
            <TabsContent value="solver">
              <div className="space-y-6">
                <MethodSelector />
                <SolverSettings />
              </div>
            </TabsContent>
          </Tabs>

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

