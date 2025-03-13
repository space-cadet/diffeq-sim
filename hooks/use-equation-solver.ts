"use client"

import { useState } from "react"
import { useEquation } from "@/context/equation-context"
import { parseEquationToFunction, solveEquation } from "@/lib/solvers"
import { solveSecondOrderODE } from "@/lib/second-order-solver"
import {
  solveLogisticGrowth,
  solveExponentialGrowth,
  solveHarmonicOscillator,
  solveDampedOscillator,
  solvePendulum,
  solveLotkaVolterra,
} from "@/lib/common-equations"

export function useEquationSolver() {
  const { state } = useEquation()
  const [solution, setSolution] = useState<{ t: number[]; y: number[][] } | null>(null)
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const solve = () => {
    setIsComputing(true)
    setError(null)

    try {
      // Extract parameter values
      const parameterValues: Record<string, number> = {}
      state.parameters.forEach((param) => {
        parameterValues[param.name] = param.value
      })

      // Identify the equation type
      const equation = state.equation.toLowerCase()

      // Check for common equation patterns
      const isLogisticGrowth = equation.includes("r*") && equation.includes("*(1") && equation.includes("/k")
      const isExponentialGrowth = equation.includes("r*") && !equation.includes("*(1")
      const isHarmonicOscillator = equation.includes("d^2") && equation.includes("-k*") && !equation.includes("c*d")
      const isDampedOscillator = equation.includes("d^2") && equation.includes("-k*") && equation.includes("c*d")
      const isPendulum = equation.includes("sin(") || equation.includes("sin ")
      const isLotkaVolterra = equation.includes("x*y") && equation.includes("\n")

      if (isPendulum) {
        // Get parameters
        const g = parameterValues.g || 9.8
        const L = parameterValues.L || 1.0

        // Get initial conditions
        const initialAngle =
          state.initialConditions.find((ic) => (ic.variable === "θ" || ic.variable === "theta") && ic.order === 0)
            ?.value || 0.5

        const initialAngularVelocity =
          state.initialConditions.find((ic) => (ic.variable === "ω" || ic.variable === "omega") && ic.order === 0)
            ?.value || 0.0

        // Solve using specialized solver
        const result = solvePendulum(
          g,
          L,
          initialAngle,
          initialAngularVelocity,
          state.timeRange.start,
          state.timeRange.end,
          state.stepSize,
          state.method,
        )

        setSolution(result)
      } else if (isLotkaVolterra) {
        // Get parameters
        const alpha = parameterValues.α || parameterValues.alpha || 1.0
        const beta = parameterValues.β || parameterValues.beta || 0.1
        const delta = parameterValues.δ || parameterValues.delta || 0.1
        const gamma = parameterValues.γ || parameterValues.gamma || 1.0

        // Get initial conditions
        const initialPrey = state.initialConditions.find((ic) => ic.variable === "x" && ic.order === 0)?.value || 10.0
        const initialPredator =
          state.initialConditions.find((ic) => ic.variable === "y" && ic.order === 0)?.value || 5.0

        // Solve using specialized solver
        const result = solveLotkaVolterra(
          alpha,
          beta,
          delta,
          gamma,
          initialPrey,
          initialPredator,
          state.timeRange.start,
          state.timeRange.end,
          state.stepSize,
          state.method,
        )

        setSolution(result)
      } else if (isLogisticGrowth) {
        // Get parameters
        const r = parameterValues.r || 1.0
        const K = parameterValues.K || 10.0

        // Get initial condition
        const initialValue =
          state.initialConditions.find((ic) => (ic.variable === "y" || ic.variable === "P") && ic.order === 0)?.value ||
          0.5

        // Solve using specialized solver
        const result = solveLogisticGrowth(
          r,
          K,
          initialValue,
          state.timeRange.start,
          state.timeRange.end,
          state.stepSize,
          state.method,
        )

        setSolution(result)
      } else if (isExponentialGrowth) {
        // Get parameter
        const r = parameterValues.r || 0.5

        // Get initial condition
        const initialValue =
          state.initialConditions.find((ic) => (ic.variable === "y" || ic.variable === "P") && ic.order === 0)?.value ||
          1.0

        // Solve using specialized solver
        const result = solveExponentialGrowth(
          r,
          initialValue,
          state.timeRange.start,
          state.timeRange.end,
          state.stepSize,
          state.method,
        )

        setSolution(result)
      } else if (isHarmonicOscillator) {
        // Get parameter
        const k = parameterValues.k || parameterValues.ω * parameterValues.ω || 1.0

        // Get initial conditions
        const initialPosition =
          state.initialConditions.find((ic) => (ic.variable === "y" || ic.variable === "x") && ic.order === 0)?.value ||
          1.0

        const initialVelocity =
          state.initialConditions.find((ic) => (ic.variable === "v" || ic.variable === "ẋ") && ic.order === 0)?.value ||
          0.0

        // Solve using specialized solver
        const result = solveHarmonicOscillator(
          k,
          initialPosition,
          initialVelocity,
          state.timeRange.start,
          state.timeRange.end,
          state.stepSize,
          state.method,
        )

        setSolution(result)
      } else if (isDampedOscillator) {
        // Get parameters
        const k = parameterValues.k || 1.0
        const c = parameterValues.c || 0.2

        // Get initial conditions
        const initialPosition =
          state.initialConditions.find((ic) => (ic.variable === "y" || ic.variable === "x") && ic.order === 0)?.value ||
          1.0

        const initialVelocity =
          state.initialConditions.find((ic) => (ic.variable === "v" || ic.variable === "ẋ") && ic.order === 0)?.value ||
          0.0

        // Solve using specialized solver
        const result = solveDampedOscillator(
          k,
          c,
          initialPosition,
          initialVelocity,
          state.timeRange.start,
          state.timeRange.end,
          state.stepSize,
          state.method,
        )

        setSolution(result)
      } else {
        // Extract variable names
        const variableNames = state.variables.map((v) => v.name)

        // Check if this is a second-order equation
        const isSecondOrder = equation.includes("d^2") || equation.includes("d²")

        if (isSecondOrder) {
          // For second-order equations, use our specialized solver
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

