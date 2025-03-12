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

    // Basic validation for a single equation
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

    // Check for differential notation patterns
    // This handles various forms like dy/dx, d^2y/dx^2, etc.
    const isDifferential = leftSide.includes("d") && leftSide.includes("/")

    // Parse with mathjs
    let expr
    try {
      expr = math.parse(rightSide)
    } catch (e) {
      return {
        isValid: false,
        variables: [],
        parameters: [],
        error: `Error parsing right side of equation: ${e instanceof Error ? e.message : String(e)}`,
      }
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

    if (isDifferential) {
      // Extract dependent variable from left side using more robust regex patterns
      // This handles forms like dy/dx, d^2y/dx^2, d^2y/dt^2, etc.

      // First, try to match standard first derivative pattern: dy/dx or dy/dt
      let match = leftSide.match(/d([a-zA-Z][a-zA-Z0-9]*)\/d[xt]/)

      // If that doesn't work, try to match second derivative pattern: d^2y/dx^2 or d^2y/dt^2
      if (!match) {
        match = leftSide.match(/d\^?2([a-zA-Z][a-zA-Z0-9]*)\/d[xt]\^?2/)
      }

      // If that doesn't work, try a more general pattern
      if (!match) {
        match = leftSide.match(/d\^?\d*([a-zA-Z][a-zA-Z0-9]*)\/d[xt]\^?\d*/)
      }

      if (match && match[1]) {
        dependentVars.add(match[1])
      } else {
        // If we can't extract from the left side, check if the left side is a variable
        if (leftSide.match(/^[a-zA-Z][a-zA-Z0-9]*$/)) {
          dependentVars.add(leftSide)
        }
      }
    } else {
      // For algebraic equations, the left side is typically a variable
      if (leftSide.match(/^[a-zA-Z][a-zA-Z0-9]*$/)) {
        dependentVars.add(leftSide)
      }
    }
    // For harmonic oscillator and similar cases, look for common variable names
    // if they appear in the equation
    ;["y", "u", "v", "w", "z"].forEach((commonVar) => {
      if (symbols.has(commonVar) && !dependentVars.has(commonVar)) {
        dependentVars.add(commonVar)
      }
    })

    // Classify remaining symbols as parameters
    const parameters = Array.from(symbols).filter(
      (symbol) => !independentVars.has(symbol) && !dependentVars.has(symbol),
    )

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

