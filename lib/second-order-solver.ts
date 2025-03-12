import type { SolverMethod } from "@/types/equation"
import { type DiffEqFunction, solveEquation } from "./solvers"

// Convert a second-order ODE to a system of first-order ODEs
export function convertSecondOrderToSystem(
  equation: string,
  dependentVar: string,
  parameters: Record<string, number>,
): DiffEqFunction {
  // This is a simplified approach - in a real app, you'd want to parse the equation
  // more carefully to extract the coefficients and functions

  // For now, we'll handle a few common forms:

  // 1. Simple harmonic oscillator: d^2y/dt^2 = -k*y
  if (equation.includes(`-k*${dependentVar}`)) {
    return (t: number, y: number[], params: Record<string, number>): number[] => {
      // y[0] is the position, y[1] is the velocity
      return [
        y[1], // dy/dt = v
        -params.k * y[0], // dv/dt = -k*y
      ]
    }
  }

  // 2. Damped harmonic oscillator: d^2y/dt^2 = -k*y - c*dy/dt
  if (equation.includes(`-k*${dependentVar}`) && equation.includes(`-c*d${dependentVar}/dt`)) {
    return (t: number, y: number[], params: Record<string, number>): number[] => {
      return [
        y[1], // dy/dt = v
        -params.k * y[0] - params.c * y[1], // dv/dt = -k*y - c*v
      ]
    }
  }

  // 3. Forced oscillator: d^2y/dt^2 = -k*y - c*dy/dt + F*cos(w*t)
  if (equation.includes(`-k*${dependentVar}`) && equation.includes("cos(")) {
    return (t: number, y: number[], params: Record<string, number>): number[] => {
      return [
        y[1], // dy/dt = v
        -params.k * y[0] - params.c * y[1] + params.F * Math.cos(params.w * t), // dv/dt = -k*y - c*v + F*cos(w*t)
      ]
    }
  }

  // Default case - a generic second-order ODE
  // This is a placeholder - in a real app, you'd want to parse the equation
  return (t: number, y: number[], params: Record<string, number>): number[] => {
    return [
      y[1], // dy/dt = v
      -params.k * y[0], // dv/dt = f(t, y, v)
    ]
  }
}

// Solve a second-order ODE
export function solveSecondOrderODE(
  equation: string,
  dependentVar: string,
  initialPosition: number,
  initialVelocity: number,
  tStart: number,
  tEnd: number,
  stepSize: number,
  method: SolverMethod,
  parameters: Record<string, number>,
): { t: number[]; y: number[][] } {
  // Convert to a system of first-order ODEs
  const systemFunc = convertSecondOrderToSystem(equation, dependentVar, parameters)

  // Solve the system
  return solveEquation(systemFunc, [initialPosition, initialVelocity], tStart, tEnd, stepSize, method, parameters)
}

