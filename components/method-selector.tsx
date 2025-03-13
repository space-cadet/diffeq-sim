"use client"

import { useEquation } from "@/context/equation-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getMethodDescription } from "@/lib/equation-analyzer"
import type { SolverMethod } from "@/types/equation"

export function MethodSelector() {
  const { state, dispatch } = useEquation()

  const handleMethodChange = (value: string) => {
    dispatch({
      type: "SET_METHOD",
      payload: value as SolverMethod,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Numerical Method</CardTitle>
        <CardDescription>Select the method to solve your equation</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={state.method} onValueChange={handleMethodChange} className="space-y-3">
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="euler" id="euler" className="mt-1" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="euler" className="font-medium">
                Euler Method
              </Label>
              <p className="text-sm text-muted-foreground">{getMethodDescription("euler")}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="rk4" id="rk4" className="mt-1" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="rk4" className="font-medium">
                Runge-Kutta (RK4)
              </Label>
              <p className="text-sm text-muted-foreground">{getMethodDescription("rk4")}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="midpoint" id="midpoint" className="mt-1" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="midpoint" className="font-medium">
                Midpoint Method
              </Label>
              <p className="text-sm text-muted-foreground">{getMethodDescription("midpoint")}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="heun" id="heun" className="mt-1" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="heun" className="font-medium">
                Heun's Method
              </Label>
              <p className="text-sm text-muted-foreground">{getMethodDescription("heun")}</p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

