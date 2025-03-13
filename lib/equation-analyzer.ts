import { parseEquation } from "./equation-parser"

export type EquationType = "ordinary" | "partial" | "system" | "unknown"
export type EquationOrder = 1 | 2 | 3 | "higher" | "unknown"
export type EquationLinearity = "linear" | "nonlinear" | "unknown"
export type EquationHomogeneity = "homogeneous" | "nonhomogeneous" | "unknown"

export interface EquationAnalysis {
  type: EquationType
  order: EquationOrder
  linearity: EquationLinearity
  homogeneity: EquationHomogeneity
  independentVariables: string[]
  dependentVariables: string[]
  parameters: string[]
  recommendedMethod: string
  requiresNumericalApproach: boolean
  hasAnalyticalSolution: boolean
  specialType?: string
}

export function analyzeEquation(equationString: string): EquationAnalysis {
  // Start with default analysis
  const analysis: EquationAnalysis = {
    type: "unknown",
    order: "unknown",
    linearity: "unknown",
    homogeneity: "unknown",
    independentVariables: [],
    dependentVariables: [],
    parameters: [],
    recommendedMethod: "rk4", // Default to RK4 as a safe choice
    requiresNumericalApproach: true,
    hasAnalyticalSolution: false,
  }

  try {
    // Use the existing parser to get basic information
    const parseResult = parseEquation(equationString)

    if (!parseResult.isValid) {
      return analysis
    }

    // Determine if it's a system of equations
    if (parseResult.isSystem) {
      analysis.type = "system"
      analysis.recommendedMethod = "rk4" // RK4 is generally good for systems
    } else {
      analysis.type = equationString.includes("∂") || equationString.includes("partial") ? "partial" : "ordinary"
    }

    // Extract variables and parameters
    analysis.dependentVariables = parseResult.variables.filter((v) => v !== "t" && v !== "x")
    analysis.independentVariables = parseResult.variables.filter((v) => v === "t" || v === "x")
    analysis.parameters = parseResult.parameters

    // Determine order by looking for highest derivative
    if (equationString.includes("d^3") || equationString.includes("'''")) {
      analysis.order = 3
    } else if (equationString.includes("d^2") || equationString.includes("''") || equationString.includes("²")) {
      analysis.order = 2
    } else if (equationString.includes("d") && equationString.includes("/d")) {
      analysis.order = 1
    } else if (equationString.match(/d\^(\d+)/)) {
      analysis.order = "higher"
    }

    // Check for linearity
    const hasNonlinearTerms =
      equationString.includes("^") ||
      equationString.includes("sin") ||
      equationString.includes("cos") ||
      equationString.includes("exp") ||
      equationString.includes("log") ||
      equationString.includes("*y*") ||
      equationString.includes("*x*")

    analysis.linearity = hasNonlinearTerms ? "nonlinear" : "linear"

    // Check for homogeneity (simplified check)
    const hasConstantTerm =
      equationString.includes("+ c") || equationString.includes("+ k") || equationString.match(/\+\s*\d+/)

    analysis.homogeneity = hasConstantTerm ? "nonhomogeneous" : "homogeneous"

    // Determine if analytical solution might exist
    analysis.hasAnalyticalSolution =
      analysis.linearity === "linear" && (analysis.order === 1 || analysis.order === 2) && analysis.type === "ordinary"

    // Recommend method based on equation characteristics
    if (analysis.type === "partial") {
      analysis.recommendedMethod = "finite_difference"
    } else if (analysis.type === "system") {
      analysis.recommendedMethod = "rk4"
    } else if (analysis.order === 1 && analysis.linearity === "linear") {
      analysis.recommendedMethod = "analytical"
      analysis.requiresNumericalApproach = false
    } else if (analysis.order === 1 && analysis.linearity === "nonlinear") {
      analysis.recommendedMethod = "rk4"
    } else if (analysis.order === 2) {
      analysis.recommendedMethod = "rk4"
    } else if (analysis.order === 3 || analysis.order === "higher") {
      analysis.recommendedMethod = "rk4"
    }

    // Identify special types of equations
    if (equationString.includes("r*y*(1-y/K)") || equationString.includes("r*y*(1 - y/K)")) {
      analysis.specialType = "logistic"
      analysis.recommendedMethod = "rk4"
    } else if (equationString.includes("r*y") && !equationString.includes("*(1")) {
      analysis.specialType = "exponential"
      analysis.recommendedMethod = "analytical"
      analysis.requiresNumericalApproach = false
      analysis.hasAnalyticalSolution = true
    } else if (equationString.includes("d^2") && equationString.includes("-k*y") && !equationString.includes("c*d")) {
      analysis.specialType = "harmonic_oscillator"
      analysis.recommendedMethod = "rk4"
    } else if (equationString.includes("d^2") && equationString.includes("-k*y") && equationString.includes("c*d")) {
      analysis.specialType = "damped_oscillator"
      analysis.recommendedMethod = "rk4"
    } else if (equationString.includes("sin(") || equationString.includes("sin ")) {
      analysis.specialType = "pendulum"
      analysis.recommendedMethod = "rk4"
    } else if (equationString.includes("x*y") && equationString.includes("\n")) {
      analysis.specialType = "lotka_volterra"
      analysis.recommendedMethod = "rk4"
    }

    return analysis
  } catch (error) {
    console.error("Error analyzing equation:", error)
    return analysis
  }
}

export function getMethodDescription(method: string): string {
  switch (method) {
    case "euler":
      return "Euler's method is the simplest numerical method for ODEs. It's fast but less accurate for complex equations."
    case "rk4":
      return "The 4th-order Runge-Kutta method provides a good balance of accuracy and computational efficiency for most ODEs."
    case "midpoint":
      return "The midpoint method (2nd-order Runge-Kutta) offers better accuracy than Euler with moderate computational cost."
    case "heun":
      return "Heun's method (improved Euler) provides better stability than basic Euler's method."
    case "analytical":
      return "This equation has an analytical solution that can be computed directly without numerical approximation."
    case "finite_difference":
      return "Finite difference methods are used for partial differential equations by discretizing space and time."
    default:
      return "No description available for this method."
  }
}

