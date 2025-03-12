export interface EquationState {
  equation: string
  variables: Variable[]
  parameters: Parameter[]
  initialConditions: InitialCondition[]
  timeRange: TimeRange
  method: SolverMethod
  stepSize: number
}

export interface Variable {
  id: string
  name: string
  description?: string
}

export interface Parameter {
  id: string
  name: string
  value: number
  min?: number
  max?: number
  step?: number
  description?: string
}

export interface InitialCondition {
  id: string
  variable: string
  value: number
  order: number // For higher-order equations (e.g., initial velocity)
}

export interface TimeRange {
  start: number
  end: number
}

export type SolverMethod = "euler" | "rk4" | "midpoint" | "heun"

