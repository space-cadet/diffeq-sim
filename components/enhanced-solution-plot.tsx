"use client"

import { useEffect, useRef, useState } from "react"
import Plotly from "plotly.js-dist-min"
import { useEquation } from "@/context/equation-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EnhancedSolutionPlotProps {
  solution: { t: number[]; y: number[][] } | null
  isComputing: boolean
  error: string | null
}

export function EnhancedSolutionPlot({ solution, isComputing, error }: EnhancedSolutionPlotProps) {
  const { state } = useEquation()
  const plotRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<HTMLDivElement>(null)
  const [plotType, setPlotType] = useState<string>("time")
  const [xVariable, setXVariable] = useState<number>(0)
  const [yVariable, setYVariable] = useState<number>(1)

  // Time series plot
  useEffect(() => {
    if (!plotRef.current || !solution || plotType !== "time") return

    const traces = state.variables.map((variable, index) => ({
      x: solution.t,
      y: solution.y.map((y) => y[index]),
      type: "scatter",
      mode: "lines",
      name: variable.name,
    }))

    Plotly.newPlot(plotRef.current, traces, {
      title: "Solution to Differential Equation",
      xaxis: {
        title: "Time (t)",
      },
      yaxis: {
        title: "Value",
      },
      margin: { t: 40, r: 20, b: 40, l: 50 },
      autosize: true,
      responsive: true,
    })

    // Cleanup
    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current)
      }
    }
  }, [solution, state.variables, plotType])

  // Phase portrait plot
  useEffect(() => {
    if (!phaseRef.current || !solution || plotType !== "phase" || state.variables.length < 2) return

    // For phase portrait, we need at least 2 variables
    const trace = {
      x: solution.y.map((y) => y[xVariable]),
      y: solution.y.map((y) => y[yVariable]),
      type: "scatter",
      mode: "lines",
      name: `${state.variables[xVariable]?.name || "x"} vs ${state.variables[yVariable]?.name || "y"}`,
      line: {
        color: "rgba(50, 100, 200, 0.8)",
        width: 2,
      },
    }

    Plotly.newPlot(phaseRef.current, [trace], {
      title: "Phase Portrait",
      xaxis: {
        title: state.variables[xVariable]?.name || "x",
      },
      yaxis: {
        title: state.variables[yVariable]?.name || "y",
      },
      margin: { t: 40, r: 20, b: 40, l: 50 },
      autosize: true,
      responsive: true,
    })

    // Cleanup
    return () => {
      if (phaseRef.current) {
        Plotly.purge(phaseRef.current)
      }
    }
  }, [solution, state.variables, plotType, xVariable, yVariable])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isComputing) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted/50">
        <p className="text-muted-foreground">Computing solution...</p>
      </div>
    )
  }

  if (!solution) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted/50">
        <p className="text-muted-foreground">Click "Solve Equation" to visualize the solution</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="time" onValueChange={setPlotType} value={plotType}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="time">Time Series</TabsTrigger>
            <TabsTrigger value="phase" disabled={state.variables.length < 2}>
              Phase Portrait
            </TabsTrigger>
          </TabsList>

          {plotType === "phase" && state.variables.length >= 2 && (
            <div className="flex items-center space-x-2">
              <Select value={xVariable.toString()} onValueChange={(v) => setXVariable(Number.parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="X Variable" />
                </SelectTrigger>
                <SelectContent>
                  {state.variables.map((variable, index) => (
                    <SelectItem key={variable.id} value={index.toString()}>
                      {variable.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>vs</span>
              <Select value={yVariable.toString()} onValueChange={(v) => setYVariable(Number.parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Y Variable" />
                </SelectTrigger>
                <SelectContent>
                  {state.variables.map((variable, index) => (
                    <SelectItem key={variable.id} value={index.toString()}>
                      {variable.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="time" className="mt-4">
          <div ref={plotRef} className="h-[400px] w-full" />
        </TabsContent>

        <TabsContent value="phase" className="mt-4">
          <div ref={phaseRef} className="h-[400px] w-full" />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            if (plotRef.current && plotType === "time") {
              Plotly.downloadImage(plotRef.current, {
                format: "png",
                filename: "differential-equation-solution",
              })
            } else if (phaseRef.current && plotType === "phase") {
              Plotly.downloadImage(phaseRef.current, {
                format: "png",
                filename: "phase-portrait",
              })
            }
          }}
        >
          Download Plot
        </Button>
      </div>
    </div>
  )
}

