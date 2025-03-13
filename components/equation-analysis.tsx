"use client"

import { useEffect, useState } from "react"
import { useEquation } from "@/context/equation-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { analyzeEquation, getMethodDescription, type EquationAnalysis } from "@/lib/equation-analyzer"
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function EquationAnalysis() {
  const { state } = useEquation()
  const [analysis, setAnalysis] = useState<EquationAnalysis | null>(null)

  useEffect(() => {
    if (state.equation) {
      const result = analyzeEquation(state.equation)
      setAnalysis(result)
    }
  }, [state.equation])

  if (!analysis) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Equation Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">This analysis helps determine the best method to solve your equation.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Classification and recommended solution method</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {analysis.type === "ordinary"
                ? "ODE"
                : analysis.type === "partial"
                  ? "PDE"
                  : analysis.type === "system"
                    ? "System"
                    : "Unknown"}
            </Badge>
            {analysis.order !== "unknown" && (
              <Badge variant="outline" className="text-xs">
                {typeof analysis.order === "number"
                  ? `${analysis.order}${getOrdinalSuffix(analysis.order)} Order`
                  : "Higher Order"}
              </Badge>
            )}
            {analysis.linearity !== "unknown" && (
              <Badge variant="outline" className="text-xs">
                {analysis.linearity === "linear" ? "Linear" : "Nonlinear"}
              </Badge>
            )}
            {analysis.homogeneity !== "unknown" && (
              <Badge variant="outline" className="text-xs">
                {analysis.homogeneity === "homogeneous" ? "Homogeneous" : "Nonhomogeneous"}
              </Badge>
            )}
            {analysis.specialType && (
              <Badge variant="outline" className="text-xs">
                {formatSpecialType(analysis.specialType)}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Variables and Parameters</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Independent:</span>{" "}
                {analysis.independentVariables.length > 0 ? analysis.independentVariables.join(", ") : "None detected"}
              </div>
              <div>
                <span className="text-muted-foreground">Dependent:</span>{" "}
                {analysis.dependentVariables.length > 0 ? analysis.dependentVariables.join(", ") : "None detected"}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Parameters:</span>{" "}
                {analysis.parameters.length > 0 ? analysis.parameters.join(", ") : "None detected"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Solution Approach</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Recommended Method:</span>
              <Badge variant="secondary">{formatMethodName(analysis.recommendedMethod)}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">{getMethodDescription(analysis.recommendedMethod)}</div>
            <div className="flex items-center gap-2 mt-2">
              {analysis.hasAnalyticalSolution ? (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Analytical solution may be available
                </div>
              ) : (
                <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Requires numerical approximation
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) {
    return "st"
  }
  if (j === 2 && k !== 12) {
    return "nd"
  }
  if (j === 3 && k !== 13) {
    return "rd"
  }
  return "th"
}

function formatSpecialType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatMethodName(method: string): string {
  switch (method) {
    case "euler":
      return "Euler"
    case "rk4":
      return "Runge-Kutta (RK4)"
    case "midpoint":
      return "Midpoint"
    case "heun":
      return "Heun's Method"
    case "analytical":
      return "Analytical"
    case "finite_difference":
      return "Finite Difference"
    default:
      return method
  }
}

