"use client"

import { useEquation } from "@/context/equation-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"

export function InitialConditions() {
  const { state, dispatch } = useEquation()

  const handleInitialConditionChange = (id: string, value: number) => {
    dispatch({
      type: "UPDATE_INITIAL_CONDITION",
      payload: { id, value },
    })
  }

  // Ensure all variables have initial conditions
  useEffect(() => {
    state.variables.forEach((variable) => {
      // Check if this variable already has an initial condition
      const hasInitialCondition = state.initialConditions.some((ic) => ic.variable === variable.name && ic.order === 0)

      // If not, add one
      if (!hasInitialCondition) {
        dispatch({
          type: "SET_INITIAL_CONDITION",
          payload: {
            variable: variable.name,
            value: 1.0,
            order: 0,
          },
        })
      }

      // For second-order equations, ensure we have initial velocity too
      if (state.equation.includes("d^2") || state.equation.includes("''")) {
        const hasVelocityCondition = state.initialConditions.some(
          (ic) => ic.variable === variable.name && ic.order === 1,
        )

        if (!hasVelocityCondition) {
          dispatch({
            type: "SET_INITIAL_CONDITION",
            payload: {
              variable: variable.name,
              value: 0.0,
              order: 1,
            },
          })
        }
      }
    })
  }, [state.variables, state.equation, state.initialConditions, dispatch])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initial Conditions</CardTitle>
        <CardDescription>Set the initial conditions for your differential equation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {state.initialConditions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No variables detected. Enter an equation first.
            </div>
          ) : (
            state.initialConditions.map((ic) => {
              const variable = state.variables.find((v) => v.name === ic.variable)
              if (!variable) return null

              return (
                <div key={ic.id} className="grid gap-2">
                  <Label htmlFor={`ic-${ic.id}`}>
                    {ic.order === 0
                      ? `${variable.name}(0) =`
                      : ic.order === 1
                        ? `${variable.name}'(0) =`
                        : `${variable.name}${"'".repeat(ic.order)}(0) =`}
                  </Label>
                  <Input
                    id={`ic-${ic.id}`}
                    type="number"
                    value={ic.value}
                    onChange={(e) => handleInitialConditionChange(ic.id, Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

