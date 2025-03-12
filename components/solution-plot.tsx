"use client"

import { useEffect, useRef } from "react"
import Plotly from "plotly.js-dist-min"
import { useEquation } from "@/context/equation-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface SolutionPlotProps {
  solution: { t: number[]; y: number[][] } | null
  isComputing: boolean
  error: string | null
}

export function SolutionPlot({ solution, isComputing, error }: SolutionPlotProps) {
  const { state } = useEquation()
  const plotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plotRef.current || !solution) return

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
  }, [solution, state.variables])

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

  return <div ref={plotRef} className="h-[400px] w-full" />
}

