"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useEquation } from "@/context/equation-context"
import { parseEquation } from "@/lib/equation-parser"
import { analyzeEquation } from "@/lib/equation-analyzer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function EnhancedEquationInput() {
  const { state, dispatch } = useEquation()
  const [equationInput, setEquationInput] = useState(state.equation)
  const [error, setError] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(true)

  const handleEquationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEquationInput(e.target.value)
  }

  const handleEquationSubmit = () => {
    const result = parseEquation(equationInput)

    if (!result.isValid) {
      setError(result.error || "Invalid equation format")
      return
    }

    setError(null)
    dispatch({ type: "SET_EQUATION", payload: equationInput })

    // Analyze the equation
    const analysis = analyzeEquation(equationInput)

    // Set the recommended method
    if (analysis.recommendedMethod) {
      dispatch({ type: "SET_METHOD", payload: analysis.recommendedMethod as any })
    }

    // Update variables based on parsing result
    state.variables.forEach((v) => {
      if (!result.variables.includes(v.name)) {
        dispatch({ type: "REMOVE_VARIABLE", payload: v.id })
      }
    })

    result.variables.forEach((varName) => {
      if (!state.variables.some((v) => v.name === varName)) {
        dispatch({
          type: "ADD_VARIABLE",
          payload: { name: varName },
        })

        // Add initial condition for new variable
        dispatch({
          type: "SET_INITIAL_CONDITION",
          payload: {
            variable: varName,
            value: 1.0,
            order: 0,
          },
        })
      }
    })

    // Handle parameters - clear existing parameters that are not in the equation
    state.parameters.forEach((p) => {
      if (!result.parameters.includes(p.name)) {
        dispatch({ type: "REMOVE_PARAMETER", payload: p.id })
      }
    })

    // Add new parameters
    result.parameters.forEach((paramName) => {
      if (!state.parameters.some((p) => p.name === paramName)) {
        dispatch({
          type: "ADD_PARAMETER",
          payload: {
            name: paramName,
            value: 1.0,
            min: -10,
            max: 10,
            step: 0.1,
          },
        })
      }
    })

    // Hide hints after successful submission
    setShowHints(false)
  }

  useEffect(() => {
    const handleUpdateEquation = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail && customEvent.detail.equation) {
        setEquationInput(customEvent.detail.equation)
      }
    }

    window.addEventListener("update-equation-input", handleUpdateEquation)

    return () => {
      window.removeEventListener("update-equation-input", handleUpdateEquation)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Differential Equation
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowHints(!showHints)}>
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Toggle hints</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to {showHints ? "hide" : "show"} input hints</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Enter your differential equation and the system will analyze it</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          {showHints && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="font-medium mb-1">Input Format Examples:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  First order: <code>dy/dt = -k*y</code>
                </li>
                <li>
                  Second order: <code>d^2y/dt^2 = -k*y</code>
                </li>
                <li>
                  System (one per line): <code>dx/dt = a*x - b*x*y</code>
                  <br />
                  <code>dy/dt = c*x*y - d*y</code>
                </li>
              </ul>
            </div>
          )}

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="equation">Equation</Label>
            <Textarea
              id="equation"
              value={equationInput}
              onChange={handleEquationChange}
              placeholder="Enter your equation (e.g., dy/dx = -k*y)"
              rows={3}
              className="font-mono"
            />
            <Button onClick={handleEquationSubmit} className="mt-2 self-end">
              Analyze & Apply
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Current equation: <code className="bg-muted px-1 py-0.5 rounded">{state.equation}</code>
        </div>
      </CardFooter>
    </Card>
  )
}

