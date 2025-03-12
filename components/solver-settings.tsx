"use client"

import { useEquation } from "@/context/equation-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SolverMethod } from "@/types/equation"

export function SolverSettings() {
  const { state, dispatch } = useEquation()

  const handleTimeRangeChange = (field: "start" | "end", value: number) => {
    dispatch({
      type: "SET_TIME_RANGE",
      payload: {
        ...state.timeRange,
        [field]: value,
      },
    })
  }

  const handleMethodChange = (value: string) => {
    dispatch({
      type: "SET_METHOD",
      payload: value as SolverMethod,
    })
  }

  const handleStepSizeChange = (value: number) => {
    dispatch({
      type: "SET_STEP_SIZE",
      payload: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solver Settings</CardTitle>
        <CardDescription>Configure the numerical solver settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time-start">Start Time</Label>
              <Input
                id="time-start"
                type="number"
                value={state.timeRange.start}
                onChange={(e) => handleTimeRangeChange("start", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-end">End Time</Label>
              <Input
                id="time-end"
                type="number"
                value={state.timeRange.end}
                onChange={(e) => handleTimeRangeChange("end", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solver-method">Numerical Method</Label>
            <Select value={state.method} onValueChange={handleMethodChange}>
              <SelectTrigger id="solver-method">
                <SelectValue placeholder="Select a method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="euler">Euler Method</SelectItem>
                <SelectItem value="rk4">Runge-Kutta (RK4)</SelectItem>
                <SelectItem value="midpoint">Midpoint Method</SelectItem>
                <SelectItem value="heun">Heun's Method</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-size">Step Size</Label>
            <Input
              id="step-size"
              type="number"
              min={0.001}
              max={1}
              step={0.001}
              value={state.stepSize}
              onChange={(e) => handleStepSizeChange(Number.parseFloat(e.target.value) || 0.1)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

