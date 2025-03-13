import * as math from "mathjs"

export function parseEquation(equationString: string): {
  isValid: boolean
  variables: string[]
  parameters: string[]
  error?: string
  isSystem?: boolean
} {
  try {
    // Check if this is a system of equations (contains multiple lines)
    const lines = equationString
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length > 1) {
      // Process as a system of equations
      const results = lines.map((line) => parseEquation(line))

      // Check if all equations are valid
      const isValid = results.every((result) => result.isValid)

      if (!isValid) {
        const errors = results
          .filter((result) => !result.isValid)
          .map((result) => result.error)
          .join("; ")

        return {
          isValid: false,
          variables: [],
          parameters: [],
          error: `Invalid system of equations: ${errors}`,
          isSystem: true,
        }
      }

      // Combine variables and parameters from all equations
      const variables = Array.from(new Set(results.flatMap((result) => result.variables)))
      const parameters = Array.from(new Set(results.flatMap((result) => result.parameters)))

      return {
        isValid: true,
        variables,
        parameters,
        isSystem: true,
      }
    }

    // Enhanced validation for a single equation
    if (!equationString.includes("=")) {
      return {
        isValid: false,
        variables: [],
        parameters: [],
        error: "Equation must contain an equals sign (=)",
      }
    }

    // Split into left and right sides
    const [leftSide, rightSide] = equationString.split("=").map((s) => s.trim())

    // Check for advanced mathematical expressions
    const advancedPatterns = [
      /\[.*\]/, // Matrix notation
      /\{.*\}/, // Piecewise functions
      /\|.*\|/, // Absolute value
      /\b(?:sum|prod|integral)\b/, // Summation, product, integral
    ]

    if (advancedPatterns.some((pattern) => pattern.test(rightSide))) {
      return {
        isValid: false,
        variables: [],
        parameters: [],
        error: "Advanced mathematical expressions are not yet supported. Please use basic arithmetic operations and standard functions.",
      }
    }

    // Enhanced differential notation patterns
    const isDifferential = leftSide.includes("d") && leftSide.includes("/")

    if (isDifferential && !leftSide.match(/d\^?\d*[a-zA-Z\u03B8\u03C6]\/d[xt]\^?\d*/)) {
      // Check for delayed differential notation
      const delayedPattern = /d\^?\d*[a-zA-Z\u03B8\u03C6]\([xt][+-]\d+\)\/d[xt]\^?\d*/
      if (!delayedPattern.test(leftSide)) {
        return {
          isValid: false,
          variables: [],
          parameters: [],
          error: "Invalid differential notation. Please use format like dy/dt, d^2y/dt^2, or y(t-τ).",
        }
      }
    }

    if (isDifferential && !leftSide.match(/d\^?\d*[a-zA-Z\u03B8\u03C6]\/d[xt]\^?\d*/)) {
      return {
        isValid: false,
        variables: [],
        parameters: [],
        error: "Invalid differential notation. Please use format like dy/dt or d^2y/dt^2.",
      }
    }

    // Parse with mathjs
    let expr
    try {
      expr = math.parse(rightSide)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      return {
        isValid: false,
        variables: [],
        parameters: [],
        error: `Error parsing right side of equation: ${errorMessage}. Please check your mathematical expression syntax. Common issues include:
- Missing operators between terms
- Unbalanced parentheses
- Invalid function names
- Incorrect use of mathematical constants`,      }
    }

    // Extract variables and parameters
    const symbols = new Set<string>()
    const extractSymbols = (node: math.MathNode) => {
      if (node.type === "SymbolNode") {
        symbols.add(node.name)
      }
      if ("args" in node && Array.isArray(node.args)) {
        node.args.forEach(extractSymbols)
      }
    }

    extractSymbols(expr)

    // Determine which symbols are variables vs parameters
    const independentVars = new Set(["x", "t"])
    const dependentVars = new Set<string>()
    const knownParameters = new Set(["g", "L", "r", "K", "k", "c", "α", "β", "δ", "γ", "ω"])

    // Extract dependent variable from left side
    if (isDifferential) {
      // Try to match various derivative patterns
      let match = leftSide.match(/d([a-zA-Z][a-zA-Z0-9]*|\u03B8|\u03C6)\/d[xt]/)

      if (!match) {
        match = leftSide.match(/d\^?2([a-zA-Z][a-zA-Z0-9]*|\u03B8|\u03C6)\/d[xt]\^?2/)
      }

      if (!match) {
        match = leftSide.match(/d\^?\d*([a-zA-Z][a-zA-Z0-9]*|\u03B8|\u03C6)\/d[xt]\^?\d*/)
      }

      if (match && match[1]) {
        dependentVars.add(match[1])
      }
    } else if (leftSide.match(/^[a-zA-Z][a-zA-Z0-9]*$/)) {
      dependentVars.add(leftSide)
    }

    // Special case for pendulum equation: d^2θ/dt^2 + (g/L)*sin(θ) = 0
    if (equationString.includes("sin(") || equationString.includes("sin ")) {
      // Look for variables inside sin, cos, etc.
      const trigMatch = rightSide.match(/sin\s*$$([a-zA-Z][a-zA-Z0-9]*|\u03B8|\u03C6)$$/)
      if (trigMatch && trigMatch[1]) {
        dependentVars.add(trigMatch[1])
      }

      // For pendulum equation, g and L are parameters
      if (symbols.has("g")) knownParameters.add("g")
      if (symbols.has("L")) knownParameters.add("L")
    }

    // For Greek letters like θ (theta) and φ (phi) that are common in physics
    if (symbols.has("θ") || symbols.has("\u03B8")) dependentVars.add("θ")
    if (symbols.has("φ") || symbols.has("\u03C6"))
      dependentVars.add("φ")

      // For common variable names
    ;["y", "u", "v", "w", "z", "P", "N"].forEach((commonVar) => {
      if (symbols.has(commonVar) && !dependentVars.has(commonVar)) {
        dependentVars.add(commonVar)
      }
    })

    // Classify remaining symbols as parameters or variables
    const parameters = Array.from(symbols).filter((symbol) => {
      // If it's a known parameter or not a dependent variable
      return (
        knownParameters.has(symbol) ||
        (!independentVars.has(symbol) &&
          !dependentVars.has(symbol) &&
          !["sin", "cos", "tan", "exp", "log"].includes(symbol))
      )
    })

    // Combine dependent and independent variables
    const variables = [...Array.from(independentVars).filter((v) => symbols.has(v)), ...Array.from(dependentVars)]

    return {
      isValid: true,
      variables,
      parameters,
    }
  } catch (e) {
    return {
      isValid: false,
      variables: [],
      parameters: [],
      error: `Error parsing equation: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
}

