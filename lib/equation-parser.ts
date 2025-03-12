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

    // Check for differential notation (dy/dx, d²y/dx², etc.)
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
    // For simplicity, we'll consider 'x' and 't' as the independent variables
    // and any symbol on the left side as a dependent variable
    const independentVars = new Set(["x", "t"])
    const dependentVars = new Set<string>()

    if (isDifferential) {
      // Extract dependent variable from left side (e.g., 'y' from 'dy/dx')
      const match = leftSide.match(/d(\w+)\/d/)
      if (match && match[1]) {
        dependentVars.add(match[1])
      }
    } else {
      // For algebraic equations, the left side is typically a variable
      if (leftSide.match(/^\w+$/)) {
        dependentVars.add(leftSide)
      }
    }

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

