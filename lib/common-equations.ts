import type { SolverMethod } from "@/types/equation"
import { solveEquation } from "./solvers"

// Logistic growth equation: dy/dt = r*y*(1 - y/K)
export function solveLogisticGrowth(
  r: number,
  K: number,
  initialValue: number,
  tStart: number,
  tEnd: number,
  stepSize: number,
  method: SolverMethod,
): { t: number[]; y: number[][] } {
  const logisticFunction = (t: number, y: number[], params: Record<string, number>): number[] => {
    return [params.r * y[0] * (1 - y[0] / params.K)]
  }

  return solveEquation(logisticFunction, [initialValue], tStart, tEnd, stepSize, method, { r, K })
}

// Exponential growth equation: dy/dt = r*y
export function solveExponentialGrowth(
  r: number,
  initialValue: number,
  tStart: number,
  tEnd: number,
  stepSize: number,
  method: SolverMethod,
): { t: number[]; y: number[][] } {
  const exponentialFunction = (t: number, y: number[], params: Record<string, number>): number[] => {
    return [params.r * y[0]]
  }

  return solveEquation(exponentialFunction, [initialValue], tStart, tEnd, stepSize, method, { r })
}

// Simple harmonic oscillator: d^2y/dt^2 = -k*y
export function solveHarmonicOscillator(
  k: number,
  initialPosition: number,
  initialVelocity: number,
  tStart: number,
  tEnd: number,
  stepSize: number,
  method: SolverMethod,
): { t: number[]; y: number[][] } {
  const harmonicFunction = (t: number, y: number[], params: Record<string, number>): number[] => {
    return [
      y[1], // dy/dt = v
      -params.k * y[0], // dv/dt = -k*y
    ]
  }

  return solveEquation(harmonicFunction, [initialPosition, initialVelocity], tStart, tEnd, stepSize, method, { k })
}

// Damped harmonic oscillator: d^2y/dt^2 = -k*y - c*dy/dt
export function solveDampedOscillator(
  k: number,
  c: number,
  initialPosition: number,
  initialVelocity: number,
  tStart: number,
  tEnd: number,
  stepSize: number,
  method: SolverMethod,
): { t: number[]; y: number[][] } {
  const dampedFunction = (t: number, y: number[], params: Record<string, number>): number[] => {
    return [
      y[1], // dy/dt = v
      -params.k * y[0] - params.c * y[1], // dv/dt = -k*y - c*v
    ]
  }

  return solveEquation(dampedFunction, [initialPosition, initialVelocity], tStart, tEnd, stepSize, method, { k, c })
}

// Pendulum equation: d^2θ/dt^2 + (g/L)*sin(θ) = 0
export function solvePendulum(
  g: number,
  L: number,
  initialAngle: number,
  initialAngularVelocity: number,
  tStart: number,
  tEnd: number,
  stepSize: number,
  method: SolverMethod,
): { t: number[]; y: number[][] } {
  const pendulumFunction = (t: number, y: number[], params: Record<string, number>): number[] => {
    return [
      y[1], // dθ/dt = ω
      -(params.g / params.L) * Math.sin(y[0]), // dω/dt = -(g/L)*sin(θ)
    ]
  }

  return solveEquation(pendulumFunction, [initialAngle, initialAngularVelocity], tStart, tEnd, stepSize, method, {
    g,
    L,
  })
}

// Lotka-Volterra (predator-prey) equations:
// dx/dt = α*x - β*x*y
// dy/dt = δ*x*y - γ*y
export function solveLotkaVolterra(
  alpha: number,
  beta: number,
  delta: number,
  gamma: number,
  initialPrey: number,
  initialPredator: number,
  tStart: number,
  tEnd: number,
  stepSize: number,
  method: SolverMethod,
): { t: number[]; y: number[][] } {
  const lotkaVolterraFunction = (t: number, y: number[], params: Record<string, number>): number[] => {
    return [
      params.alpha * y[0] - params.beta * y[0] * y[1], // dx/dt = α*x - β*x*y
      params.delta * y[0] * y[1] - params.gamma * y[1], // dy/dt = δ*x*y - γ*y
    ]
  }

  return solveEquation(lotkaVolterraFunction, [initialPrey, initialPredator], tStart, tEnd, stepSize, method, {
    alpha,
    beta,
    delta,
    gamma,
  })
}

