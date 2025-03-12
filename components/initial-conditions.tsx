"use client"

import { useEquation } from "@/context/equation-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function InitialConditions() {
  const { state, dispatch } = useEquation()

  const handleInitialConditionChange = (id: string, value: number) => {
    dispatch({
      type: "UPDATE_INITIAL_CONDITION",
      payload: { id, value },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initial Conditions</CardTitle>
        <CardDescription>Set the initial conditions for your differential equation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {state.initialConditions.map((ic) => {
            const variable = state.variables.find((v) => v.name === ic.variable)
            if (!variable) return null

            return (
              <div key={ic.id} className="grid gap-2">
                <Label htmlFor={`ic-${ic.id}`}>
                  {ic.order === 0 ? `${variable.name}(0) =` : `${variable.name}${"^".repeat(ic.order)}(0) =`}
                </Label>
                <Input
                  id={`ic-${ic.id}`}
                  type="number"
                  value={ic.value}
                  onChange={(e) => handleInitialConditionChange(ic.id, Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

