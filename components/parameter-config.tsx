"use client"

import { useEquation } from "@/context/equation-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

export function ParameterConfig() {
  const { state, dispatch } = useEquation()

  const handleParameterChange = (id: string, value: number) => {
    dispatch({
      type: "UPDATE_PARAMETER",
      payload: { id, value },
    })
  }

  const handleAddParameter = () => {
    dispatch({
      type: "ADD_PARAMETER",
      payload: {
        name: `p${state.parameters.length + 1}`,
        value: 1.0,
        min: -10,
        max: 10,
        step: 0.1,
      },
    })
  }

  const handleRemoveParameter = (id: string) => {
    dispatch({
      type: "REMOVE_PARAMETER",
      payload: id,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parameters</CardTitle>
        <CardDescription>Configure the parameters for your differential equation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {state.parameters.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No parameters detected in the equation.</div>
          ) : (
            state.parameters.map((param) => (
              <div key={param.id} className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`param-${param.id}`}>{param.name}</Label>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveParameter(param.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove parameter</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Slider
                    id={`param-${param.id}`}
                    min={param.min ?? -10}
                    max={param.max ?? 10}
                    step={param.step ?? 0.1}
                    value={[param.value]}
                    onValueChange={([value]) => handleParameterChange(param.id, value)}
                  />
                  <Input
                    type="number"
                    value={param.value}
                    onChange={(e) => handleParameterChange(param.id, Number.parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>
              </div>
            ))
          )}

          <Button variant="outline" size="sm" className="mt-2" onClick={handleAddParameter}>
            <Plus className="mr-2 h-4 w-4" />
            Add Parameter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

