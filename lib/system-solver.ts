import * as math from "mathjs"
import type { SolverMethod } from "@/types/equation"

// Define the type for a system of differential equations
export type SystemFunction = (t: number, y: number[], params: Record<string, number>) => number[]

// Parse a system of equations into a function
export function parseSystemToFunction(
  equations: string[],
  variables: string[],
  parameters: string[],
): SystemFunction | null {
  try {
    // Parse each equation
    const parsedEquations = equations.map((eq) => {
      // Basic validation
      if (!eq.includes("=")) {
        throw new Error("Equation must contain an equals sign (=)")
      }

      // Split into left and right sides
      const [leftSide, rightSide] = eq.split("=").map((s) => s.trim())

      // Parse the right side with mathjs
      return math.parse(rightSide).compile()
    })

    // Create a function that evaluates all equations with the given variables and parameters
    return (t: number, y: number[], params: Record<string, number>): number[] => {
      // Create a scope with the current values
      const scope: Record<string, number> = {
        t,
        ...params,
      }

      // Add variables to scope
      variables.forEach((variable, index) => {
        scope[variable] = y[index]
      })

      // Evaluate each equation
      return parsedEquations.map((eq) => eq.evaluate(scope))
    }
  } catch (error) {
    console.error("Error parsing system of equations:", error)
    return null
  }
}

// Solve a system of differential equations
export function solveSystem(
  system: SystemFunction,
  initialConditions: number[],
  tStart: number,
  tEnd: number,
  stepSize: number,
  method: SolverMethod,
  parameters: Record<string, number>,
): { t: number[]; y: number[][] } {
  // Initialize arrays to store results
  const tValues: number[] = [tStart]
  const yValues: number[][] = [initialConditions]

  // Current time and state
  let t = tStart
  let y = [...initialConditions]

  // Solve until we reach the end time
  while (t < tEnd) {
    // Calculate the next state based on the selected method
    let nextY: number[]

    switch (method) {
      case "euler":
        nextY = eulerStep(system, t, y, stepSize, parameters)
        break
      case "rk4":
        nextY = rk4Step(system, t, y, stepSize, parameters)
        break
      case "midpoint":
        nextY = midpointStep(system, t, y, stepSize, parameters)
        break
      case "heun":
        nextY = heunStep(system, t, y, stepSize, parameters)
        break
      default:
        nextY = eulerStep(system, t, y, stepSize, parameters)
    }

    // Update time and state
    t += stepSize
    y = nextY

    // Store results
    tValues.push(t)
    yValues.push([...y])
  }

  return { t: tValues, y: yValues }
}

// Euler method for systems
function eulerStep(
  system: SystemFunction,
  t: number,
  y: number[],
  h: number,
  params: Record<string, number>,
): number[] {
  const dydt = system(t, y, params)
  return y.map((yi, i) => yi + h * dydt[i])
}

// Runge-Kutta 4th order method for systems
function rk4Step(system: SystemFunction, t: number, y: number[], h: number, params: Record<string, number>): number[] {
  const k1 = system(t, y, params)

  const k2y = y.map((yi, i) => yi + (h * k1[i]) / 2)
  const k2 = system(t + h / 2, k2y, params)

  const k3y = y.map((yi, i) => yi + (h * k2[i]) / 2)
  const k3 = system(t + h / 2, k3y, params)

  const k4y = y.map((yi, i) => yi + h * k3[i])
  const k4 = system(t + h, k4y, params)

  return y.map((yi, i) => yi + (h * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) / 6)
}

// Midpoint method for systems
function midpointStep(
  system: SystemFunction,
  t: number,
  y: number[],
  h: number,
  params: Record<string, number>,
): number[] {
  const k1 = system(t, y, params)

  const k2y = y.map((yi, i) => yi + (h * k1[i]) / 2)
  const k2 = system(t + h / 2, k2y, params)

  return y.map((yi, i) => yi + h * k2[i])
}

// Heun's method for systems
function heunStep(system: SystemFunction, t: number, y: number[], h: number, params: Record<string, number>): number[] {
  const k1 = system(t, y, params)

  const yPredict = y.map((yi, i) => yi + h * k1[i])
  const k2 = system(t + h, yPredict, params)

  return y.map((yi, i) => yi + (h * (k1[i] + k2[i])) / 2)
}

