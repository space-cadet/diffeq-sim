"use client"

import { useState } from "react"
import { useEquation } from "@/context/equation-context"
import { parseEquationToFunction, solveEquation } from "@/lib/solvers"
// Import the second-order solver
import { solveSecondOrderODE } from "@/lib/second-order-solver"

export function useEquationSolver() {
  const { state } = useEquation()
  const [solution, setSolution] = useState<{ t: number[]; y: number[][] } | null>(null)
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update the solve function to use the second-order solver
  const solve = () => {
    setIsComputing(true)
    setError(null)

    try {
      // Extract variable names
      const variableNames = state.variables.map((v) => v.name)

      // Extract parameter values
      const parameterValues: Record<string, number> = {}
      state.parameters.forEach((param) => {
        parameterValues[param.name] = param.value
      })

      // Check if this is a second-order equation
      const isSecondOrder = state.equation.includes("d^2") || state.equation.includes("d²")

      if (isSecondOrder) {
        // For second-order equations, use our specialized solver

        // Determine the dependent variable
        // This is a simplified approach - in a real app, you'd want to parse the equation
        // more carefully to extract the dependent variable
        const dependentVar = state.variables[0]?.name || "y"

        // Extract initial conditions
        const initialPosition =
          state.initialConditions.find((ic) => ic.variable === dependentVar && ic.order === 0)?.value || 0
        const initialVelocity =
          state.initialConditions.find((ic) => ic.variable === dependentVar && ic.order === 1)?.value || 0

        // Solve the second-order ODE
        const result = solveSecondOrderODE(
          state.equation,
          dependentVar,
          initialPosition,
          initialVelocity,
          state.timeRange.start,
          state.timeRange.end,
          state.stepSize,
          state.method,
          parameterValues,
        )

        setSolution(result)
      } else {
        // For first-order equations, proceed as before
        const diffEqFunc = parseEquationToFunction(state.equation, variableNames, Object.keys(parameterValues))

        if (!diffEqFunc) {
          throw new Error("Failed to parse equation")
        }

        // Extract initial conditions
        const initialValues = state.initialConditions.filter((ic) => ic.order === 0).map((ic) => ic.value)

        // Solve the equation
        const result = solveEquation(
          diffEqFunc,
          initialValues,
          state.timeRange.start,
          state.timeRange.end,
          state.stepSize,
          state.method,
          parameterValues,
        )

        setSolution(result)
      }
    } catch (err) {
      setError(`Error solving equation: ${err instanceof Error ? err.message : String(err)}`)
      setSolution(null)
    } finally {
      setIsComputing(false)
    }
  }

  return {
    solution,
    isComputing,
    error,
    solve,
  }
}

