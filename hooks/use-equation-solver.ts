"use client"

import { useState } from "react"
import { useEquation } from "@/context/equation-context"
import { parseEquationToFunction, solveEquation } from "@/lib/solvers"

export function useEquationSolver() {
  const { state } = useEquation()
  const [solution, setSolution] = useState<{ t: number[]; y: number[][] } | null>(null)
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      // Parse the equation
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

