import * as math from "mathjs"
import type { SolverMethod } from "@/types/equation"

export interface EquationAnalysis {
  type: EquationType
  order: number
  isLinear: boolean
  isHomogeneous: boolean
  isAutonomous: boolean
  stiffness: StiffnessLevel
  recommendedMethod: SolverMethod
  requiredInitialConditions: number
  specialType?: SpecialEquationType
  explanation: string
}

export type EquationType = "ODE" | "PDE" | "System" | "Algebraic" | "Unknown"
export type StiffnessLevel = "Non-stiff" | "Moderately Stiff" | "Stiff" | "Unknown"
export type SpecialEquationType =
  | "Logistic"
  | "Exponential"
  | "Harmonic Oscillator"
  | "Damped Oscillator"
  | "Pendulum"
  | "Lotka-Volterra"
  | "None"

/**
 * Analyzes a differential equation to determine its properties and recommend a solver
 */
export function analyzeEquation(equationString: string): EquationAnalysis {
  // Default analysis result
  const defaultAnalysis: EquationAnalysis = {
    type: "Unknown",
    order: 0,
    isLinear: false,
    isHomogeneous: false,
    isAutonomous: false,
    stiffness: "Unknown",
    recommendedMethod: "rk4", // Default to RK4 as a general-purpose method
    requiredInitialConditions: 1,
    specialType: "None",
    explanation: "Unable to analyze equation.",
  }

  try {
    // Check if this is a system of equations
    const lines = equationString
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length > 1) {
      return analyzeSystemOfEquations(lines)
    }

    // Basic validation for a single equation
    if (!equationString.includes("=")) {
      return {
        ...defaultAnalysis,
        explanation: "Equation must contain an equals sign (=).",
      }
    }

    // Split into left and right sides
    const [leftSide, rightSide] = equationString.split("=").map((s) => s.trim())

    // Determine equation type and order
    const analysis = determineEquationType(leftSide, rightSide)
    
    // Check for special equation types
    const specialType = identifySpecialEquationType(equationString)
    
    // Determine linearity
    const isLinear = checkLinearity(equationString, analysis.type)
    
    // Determine if homogeneous
    const isHomogeneous = checkHomogeneity(equationString, analysis.type)
    
    // Determine if autonomous (time-independent)
    const isAutonomous = !equationString.includes("t") || 
                        (equationString.includes("d") && 
                         equationString.includes("/dt") && 
                         !rightSide.includes("t"))
    
    // Estimate stiffness level
    const stiffness = estimateStiffness(equationString, specialType)
    
    // Recommend solver method based on analysis
    const recommendedMethod = recommendSolverMethod(analysis.type, analysis.order, isLinear, stiffness, specialType)
    
    // Determine required initial conditions
    const requiredInitialConditions = analysis.order
    
    // Generate explanation
    const explanation = generateExplanation(
      analysis.type, 
      analysis.order, 
      isLinear, 
      isHomogeneous, 
      isAutonomous, 
      stiffness, 
      specialType, 
      recommendedMethod
    )
    
    return {
      ...analysis,
      isLinear,
      isHomogeneous,
      isAutonomous,
      stiffness,
      recommendedMethod,
      requiredInitialConditions,
      specialType,
      explanation,
    }
  } catch (e) {
    return {
      ...defaultAnalysis,
      explanation: `Error analyzing equation: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
}

/**
 * Analyzes a system of differential equations
 */
function analyzeSystemOfEquations(equations: string[]): EquationAnalysis {
  try {
    // Analyze each equation individually
    const individualAnalyses = equations.map(analyzeEquation)
    
    // Determine the highest order among all equations
    const maxOrder = Math.max(...individualAnalyses.map(a => a.order))
    
    // Check if all equations are linear
    const allLinear = individualAnalyses.every(a => a.isLinear)
    
    // Check if all equations are autonomous
    const allAutonomous = individualAnalyses.every(a => a.isAutonomous)
    
    // Determine stiffness for the system
    let systemStiffness: StiffnessLevel = "Non-stiff"
    if (individualAnalyses.some(a => a.stiffness === "Stiff")) {
      systemStiffness = "Stiff"
    } else if (individualAnalyses.some(a => a.stiffness === "Moderately Stiff")) {
      systemStiffness = "Moderately Stiff"
    }
    
    // Check for special system types
    let specialType: SpecialEquationType = "None"
    
    // Check for Lotka-Volterra predator-prey system
    if (equations.length === 2 && 
        equations.some(eq => eq.includes("x*y")) && 
        equations.some(eq => eq.includes("-") && eq.includes("y"))) {
      specialType = "Lotka-Volterra"
    }
    
    // Recommend solver method for the system
    const recommendedMethod = recommendSolverMethod("System", maxOrder, allLinear, systemStiffness, specialType)
    
    // Calculate total required initial conditions
    const requiredInitialConditions = equations.length * maxOrder
    
    // Generate explanation
    const explanation = generateSystemExplanation(
      equations.length,
      maxOrder,
      allLinear,
      allAutonomous,
      systemStiffness,
      specialType,
      recommendedMethod
    )
    
    return {
      type: "System",
      order: maxOrder,
      isLinear: allLinear,
      isHomogeneous: false, // Simplification for systems
      isAutonomous: allAutonomous,
      stiffness: systemStiffness,
      recommendedMethod,
      requiredInitialConditions,
      specialType,
      explanation,
    }
  } catch (e) {
    return {
      type: "System",
      order: 1,
      isLinear: false,
      isHomogeneous: false,
      isAutonomous: false,
      stiffness: "Unknown",
      recommendedMethod: "rk4",
      requiredInitialConditions: equations.length,
      specialType: "None",
      explanation: `Error analyzing system of equations: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
}

/**
 * Determines the type and order of a differential equation
 */
function determineEquationType(leftSide: string, rightSide: string): { type: EquationType; order: number } {
  // Check for differential notation patterns
  if (leftSide.includes("d") && leftSide.includes("/")) {
    // Check for partial differential equations (PDEs)
    if (leftSide.includes("∂") || leftSide.includes("\\partial")) {
      return { type: "PDE", order: 1 }
    }
    
    // Check for higher-order ODEs
    const orderMatch = leftSide.match(/d\^?(\d+)/)
    if (orderMatch && orderMatch[1]) {
      return { type: "ODE", order: parseInt(orderMatch[1]) }
    }
    
    // Check for second-order notation like d²y/dx²
    if (leftSide.includes("²") || leftSide.includes("^2")) {
      return { type: "ODE", order: 2 }
    }
    
    // Default to first-order ODE
    return { type: "ODE", order: 1 }
  }
  
  // If no differential notation, check if it's an algebraic equation
  if (leftSide.match(/^[a-zA-Z][a-zA-Z0-9]*$/) && !rightSide.includes("d")) {
    return { type: "Algebraic", order: 0 }
  }
  
  // Default case
  return { type: "Unknown", order: 0 }
}

/**
 * Identifies special types of differential equations
 */
function identifySpecialEquationType(equation: string): SpecialEquationType {
  const lowerEquation = equation.toLowerCase()
  
  // Check for logistic growth equation: dy/dt = r*y*(1-y/K)
  if (lowerEquation.includes("r*") && lowerEquation.includes("*(1") && lowerEquation.includes("/k")) {
    return "Logistic"
  }
  
  // Check for exponential growth: dy/dt = r*y
  if (lowerEquation.includes("r*") && !lowerEquation.includes("*(1") && !lowerEquation.includes("sin")) {
    return "Exponential"
  }
  
  // Check for harmonic oscillator: d²y/dt² + k*y = 0
  if (lowerEquation.includes("d^2") && lowerEquation.includes("-k*") && !lowerEquation.includes("c*d")) {
    return "Harmonic Oscillator"
  }
  
  // Check for damped oscillator: d²y/dt² + c*dy/dt + k*y = 0
  if (lowerEquation.includes("d^2") && lowerEquation.includes("-k*") && lowerEquation.includes("c*d")) {
    return "Damped Oscillator"
  }
  
  // Check for pendulum equation: d²θ/dt² + (g/L)*sin(θ) = 0
  if (lowerEquation.includes("sin(") || lowerEquation.includes("sin ")) {
    return "Pendulum"
  }
  
  // Check for Lotka-Volterra (predator-prey) system
  if (lowerEquation.includes("x*y") && lowerEquation.includes("\n")) {
    return "Lotka-Volterra"
  }
  
  return "None"
}

/**
 * Checks if a differential equation is linear
 */
function checkLinearity(equation: string, type: EquationType): boolean {
  if (type === "Unknown" || type === "Algebraic") {
    return false
  }
  
  // Split into left and right sides
  const [leftSide, rightSide] = equation.split("=").map((s) => s.trim())
  
  // Extract the dependent variable
  let dependentVar = "y"
  const match = leftSide.match(/d[^/]*([a-zA-Z][a-zA-Z0-9]*|\u03B8|\u03C6)/)
  if (match && match[1]) {
    dependentVar = match[1]
  }
  
  // Check for nonlinear terms in the right side
  const nonlinearPatterns = [
    new RegExp(`${dependentVar}\\s*\\*\\s*${dependentVar}`), // y*y
    new RegExp(`${dependentVar}\\^\\d+`), // y^n
    new RegExp(`sin\\s*\\(.*${dependentVar}.*\\)`), // sin(y)
    new RegExp(`cos\\s*\\(.*${dependentVar}.*\\)`), // cos(y)
    new RegExp(`exp\\s*\\(.*${dependentVar}.*\\)`), // exp(y)
    new RegExp(`log\\s*\\(.*${dependentVar}.*\\)`), // log(y)
  ]
  
  for (const pattern of nonlinearPatterns) {
    if (pattern.test(rightSide)) {
      return false
    }
  }
  
  return true
}

/**
 * Checks if a differential equation is homogeneous
 */
function checkHomogeneity(equation: string, type: EquationType): boolean {
  if (type !== "ODE") {
    return false
  }
  
  // Split into left and right sides
  const [leftSide, rightSide] = equation.split("=").map((s) => s.trim())
  
  // A homogeneous equation has no constant terms
  // This is a simplified check - a more robust implementation would use symbolic math
  const constantTermPattern = /(?<![a-zA-Z0-9_])\d+(?![a-zA-Z0-9_])/
  return !constantTermPattern.test(rightSide)
}

/**
 * Estimates the stiffness level of a differential equation
 */
function estimateStiffness(equation: string, specialType: SpecialEquationType): StiffnessLevel {
  // This is a simplified estimation - a more accurate approach would analyze eigenvalues
  
  // Known stiff equation types
  if (specialType === "Damped Oscillator") {
    // Check for high damping coefficient
    const dampingMatch = equation.match(/c\s*\*\s*d[^=]+=.+/)
    if (dampingMatch) {
      const dampingTerm = dampingMatch[0]
      // If the damping coefficient appears to be large
      if (dampingTerm.includes("10*") || dampingTerm.includes("100*")) {
        return "Stiff"
      }
    }
    return "Moderately Stiff"
  }
  
  // Check for terms that might indicate stiffness
  if (equation.includes("e^") || equation.includes("exp(")) {
    return "Moderately Stiff"
  }
  
  // Default for non-stiff equations
  return "Non-stiff"
}

/**
 * Recommends the most appropriate solver method based on equation analysis
 */
function recommendSolverMethod(
  type: EquationType,
  order: number,
  isLinear: boolean,
  stiffness: StiffnessLevel,
  specialType: SpecialEquationType
): SolverMethod {
  // For special equation types, use recommended methods
  if (specialType === "Pendulum") {
    return "rk4" // RK4 is good for oscillatory systems
  }
  
  if (specialType === "Lotka-Volterra") {
    return "rk4" // RK4 is good for predator-prey systems
  }
  
  // For stiff equations
  if (stiffness === "Stiff") {
    return "rk4" // RK4 is more stable than Euler for stiff equations
  }
  
  // For non-linear equations
  if (!isLinear) {
    return "rk4" // RK4 is generally better for non-linear equations
  }
  
  // For higher-order equations
  if (order > 1) {
    return "rk4" // RK4 is more accurate for higher-order equations
  }
  
  // For simple first-order linear equations
  if (type === "ODE" && order === 1 && isLinear && stiffness === "Non-stiff") {
    // Could use Euler for very simple equations, but RK4 is generally better
    return "midpoint" // Good balance of simplicity and accuracy
  }
  
  // Default to RK4 as a general-purpose method
  return "rk4"
}

/**
 * Generates an explanation of the equation analysis
 */
function generateExplanation(
  type: EquationType,
  order: number,
  isLinear: boolean,
  isHomogeneous: boolean,
  isAutonomous: boolean,
  stiffness: StiffnessLevel,
  specialType: SpecialEquationType,
  recommendedMethod: SolverMethod
): string {
  let explanation = ""
  
  // Equation type and order
  if (type === "ODE") {
    explanation += `This is an ordinary differential equation (ODE) of order ${order}. `
  } else if (type === "PDE") {
    explanation += "This is a partial differential equation (PDE). "
  } else if (type === "System") {
    explanation += "This is a system of differential equations. "
  } else if (type === "Algebraic") {
    explanation += "This is an algebraic equation, not a differential equation. "
  } else {
    explanation += "The equation type could not be determined. "
  }
  
  // Special equation type
  if (specialType !== "None") {
    explanation += `It appears to be a ${specialType} equation. `
  }
  
  // Linearity
  explanation += isLinear ? "The equation is linear. " : "The equation is non-linear. "
  
  // Homogeneity (for ODEs)
  if (type === "ODE") {
    explanation += isHomogeneous ? "It is homogeneous. " : "It is non-homogeneous. "
  }
  
  // Autonomy
  explanation += isAutonomous ? "The equation is autonomous (time-independent). " : "The equation is non-autonomous (time-dependent). "
  
  // Stiffness
  if (stiffness === "Stiff") {
    explanation += "The equation appears to be stiff, which may require special numerical methods. "
  } else if (stiffness === "Moderately Stiff") {
    explanation += "The equation may be moderately stiff. "
  }
  
  // Required initial conditions
  if (type === "ODE" || type === "System") {
    explanation += `You will need to provide ${order} initial condition${order > 1 ? "s" : ""} for each variable. `
  }
  
  // Recommended method
  explanation += `Based on this analysis, the ${recommendedMethod} method is recommended for solving this equation.`
  
  return explanation
}

/**
 * Generates an explanation for a system of equations
 */
function generateSystemExplanation(
  numEquations: number,
  maxOrder: number,
  allLinear: boolean,
  allAutonomous: boolean,
  stiffness: StiffnessLevel,
  specialType: SpecialEquationType,
  recommendedMethod: SolverMethod
): string {
  let explanation = `This is a system of ${numEquations} differential equation${numEquations > 1 ? "s" : ""}. `
  
  // Maximum order
  explanation += `The highest order in the system is ${maxOrder}. `
  
  // Special system type
  if (specialType !== "None") {
    explanation += `It appears to be a ${specialType} system. `
  }
  
  // Linearity
  explanation += allLinear ? "All equations in the system are linear. " : "The system contains non-linear equations. "
  
  // Autonomy
  explanation += allAutonomous ? "The system is autonomous (time-independent). " : "The system is non-autonomous (time-dependent). "
  
  // Stiffness
  if (stiffness === "Stiff") {
    explanation += "The system appears to be stiff, which may require special numerical methods. "
  } else if (stiffness === "Moderately Stiff") {
    explanation += "The system may be moderately stiff. "
  }
  
  // Required initial conditions
  explanation += `You will need to provide ${numEquations * maxOrder} initial condition${numEquations * maxOrder > 1 ? "s" : ""} in total (${maxOrder} for each variable). `
  
  // Recommended method
  explanation += `Based on this analysis, the ${recommendedMethod} method is recommended for solving this system.`
  
  return explanation
}