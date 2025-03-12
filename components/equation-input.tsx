"use client"

import type React from "react"

import { useState } from "react"
import { useEquation } from "@/context/equation-context"
import { parseEquation } from "@/lib/equation-parser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EquationInput() {
  const { state, dispatch } = useEquation()
  const [equationInput, setEquationInput] = useState(state.equation)
  const [error, setError] = useState<string | null>(null)

  const handleEquationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Update variables based on parsing result
    // This is simplified - in a real app, you'd want to preserve existing variables
    // and their properties when possible
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
      }
    })

    // Similar logic for parameters
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Differential Equation</CardTitle>
        <CardDescription>Enter your differential equation (e.g., dy/dx = -k*y)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="equation">Equation</Label>
            <div className="flex space-x-2">
              <Input
                id="equation"
                value={equationInput}
                onChange={handleEquationChange}
                placeholder="Enter your equation (e.g., dy/dx = -k*y)"
              />
              <Button onClick={handleEquationSubmit}>Apply</Button>
            </div>
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
          Current equation: <code>{state.equation}</code>
        </div>
      </CardFooter>
    </Card>
  )
}

