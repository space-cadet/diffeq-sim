import * as math from "mathjs"
import type { SolverMethod } from "@/types/equation"

// Define the type for a differential equation function
export type DiffEqFunction = (t: number, y: number[], params: Record<string, number>, history?: Record<number, number[]>) => number[]

// Parse a string equation into a function
export function parseEquationToFunction(
  equationString: string,
  variables: string[],
  parameters: string[],
): DiffEqFunction | null {
  try {
    // Detect delay terms and add τ to parameters if found
    const delayRegex = /(\w+)\(t\s*-\s*(\w+)\)/g;
    let match;
    while ((match = delayRegex.exec(equationString))) {
      const delayParam = match[2];
      if (!parameters.includes(delayParam)) {
        parameters.push(delayParam);
      }
    }

    // Basic validation
    if (!equationString.includes("=")) {
      console.error("Equation must contain an equals sign (=)")
      return null
    }

    // Split into left and right sides
    const [leftSide, rightSide] = equationString.split("=").map((s) => s.trim())

    // Create a function that evaluates the expression with the given variables and parameters
    return (t: number, y: number[], params: Record<string, number>, history?: Record<number, number[]>): number[] => {
      try {
        // Create a scope with the current values
        const scope: Record<string, number> = {
          t,
          ...params,
        }

        // Add variables to scope
        variables.forEach((variable, index) => {
          scope[variable] = y[index]
        })

        // Add history values to scope
        if (history) {
          Object.entries(history).forEach(([time, values]) => {
            variables.forEach((variable, index) => {
              scope[`${variable}(t-${t - parseFloat(time)})`] = values[index];
            });
          });
        }

        // Evaluate the expression using mathjs evaluate
        const result = math.evaluate(rightSide, scope)

        return [result]
      } catch (error) {
        console.error("Error evaluating equation:", error);
        return [0];
      }
    }
  } catch (error) {
    console.error("Error parsing equation:", error);
    return null;
  }
}

// Solve a differential equation using the specified method
export function solveEquation(
  diffEq: DiffEqFunction,
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
  const history: Record<number, number[]> = { [tStart]: initialConditions }

  // Current time and state
  let t = tStart
  let y = [...initialConditions]

  // Solve until we reach the end time
  while (t < tEnd) {
    // Calculate the next state based on the selected method
    let nextY: number[]

    try {
      switch (method) {
        case "euler":
          nextY = eulerStep(diffEq, t, y, stepSize, parameters, history)
          break
        case "rk4":
          nextY = rk4Step(diffEq, t, y, stepSize, parameters, history)
          break
        case "midpoint":
          nextY = midpointStep(diffEq, t, y, stepSize, parameters, history)
          break
        case "heun":
          nextY = heunStep(diffEq, t, y, stepSize, parameters, history)
          break
        default:
          nextY = eulerStep(diffEq, t, y, stepSize, parameters, history)
      }

      // Update time and state
      t += stepSize
      y = nextY

      // Store results and history
      tValues.push(t)
      yValues.push([...y])
      history[t] = [...y]
    } catch (error) {
      console.error("Error in solver step:", error)
      // Skip this step if there's an error
      t += stepSize
    }
  }

  return { t: tValues, y: yValues }
}

// Update all solver methods to accept history parameter
function eulerStep(
  diffEq: DiffEqFunction,
  t: number,
  y: number[],
  h: number,
  params: Record<string, number>,
  history: Record<number, number[]>,
): number[] {
  const dydt = diffEq(t, y, params, history)
  return y.map((yi, i) => yi + h * dydt[i])
}

// Runge-Kutta 4th order method
function rk4Step(diffEq: DiffEqFunction, t: number, y: number[], h: number, params: Record<string, number>, history: Record<number, number[]>): number[] {
  const k1 = diffEq(t, y, params, history)

  const k2y = y.map((yi, i) => yi + (h * k1[i]) / 2)
  const k2 = diffEq(t + h / 2, k2y, params, history)

  const k3y = y.map((yi, i) => yi + (h * k2[i]) / 2)
  const k3 = diffEq(t + h / 2, k3y, params, history)

  const k4y = y.map((yi, i) => yi + h * k3[i])
  const k4 = diffEq(t + h, k4y, params, history)

  return y.map((yi, i) => yi + (h * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) / 6)
}

// Midpoint method
function midpointStep(
  diffEq: DiffEqFunction,
  t: number,
  y: number[],
  h: number,
  params: Record<string, number>,
  history: Record<number, number[]>,
): number[] {
  const k1 = diffEq(t, y, params, history)

  const k2y = y.map((yi, i) => yi + (h * k1[i]) / 2)
  const k2 = diffEq(t + h / 2, k2y, params, history)

  return y.map((yi, i) => yi + h * k2[i])
}

// Heun's method (Improved Euler)
function heunStep(
  diffEq: DiffEqFunction,
  t: number,
  y: number[],
  h: number,
  params: Record<string, number>,
  history: Record<number, number[]>,
): number[] {
  const k1 = diffEq(t, y, params, history)

  const yPredict = y.map((yi, i) => yi + h * k1[i])
  const k2 = diffEq(t + h, yPredict, params, history)

  return y.map((yi, i) => yi + (h * (k1[i] + k2[i])) / 2)
}

