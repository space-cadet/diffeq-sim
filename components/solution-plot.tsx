"use client"

import { useEffect, useRef } from "react"
import Plotly from "plotly.js-dist-min"
import { useEquation } from "@/context/equation-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SolutionPlotProps {
  solution: { t: number[]; y: number[][] } | null
  isComputing: boolean
  error: string | null
  analysisResult?: any
}

export function SolutionPlot({ solution, isComputing, error, analysisResult }: SolutionPlotProps) {
  const { state } = useEquation()
  const plotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plotRef.current || !solution) return

    // Handle different types of solutions
    const traces = state.variables.map((variable, index) => {
      const yValues = solution.y.map((y) => y[index])
      
      // Handle complex numbers
      const isComplex = yValues.some((val) => typeof val === 'object' && val !== null && 're' in val)
      
      return {
        x: solution.t,
        y: isComplex ? yValues.map((val) => Math.sqrt(val.re * val.re + val.im * val.im)) : yValues,
        type: "scatter",
        mode: "lines",
        name: variable.name,
        line: {
          color: `hsl(${(index * 360) / state.variables.length}, 70%, 50%)`,
          width: 2
        }
      }
    })

    Plotly.newPlot(plotRef.current, traces, {
      title: "Solution to Differential Equation",
      xaxis: {
        title: "Time (t)",
        gridcolor: '#e0e0e0'
      },
      yaxis: {
        title: "Value",
        gridcolor: '#e0e0e0'
      },
      margin: { t: 40, r: 20, b: 40, l: 50 },
      autosize: true,
      responsive: true,
      plot_bgcolor: '#f5f5f5',
      paper_bgcolor: '#ffffff'
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

  return (
    <div className="space-y-4">
      {analysisResult && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Equation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div><strong>Method:</strong> {state.method}</div>
              <div><strong>Step Size:</strong> {state.stepSize}</div>
              {analysisResult.specialType !== "None" && (
                <div className="col-span-2"><strong>Equation Type:</strong> {analysisResult.specialType}</div>
              )}
              <div className="col-span-2 mt-1 text-muted-foreground">{analysisResult.explanation}</div>
            </div>
          </CardContent>
        </Card>
      )}
      <div ref={plotRef} className="h-[400px] w-full" />
    </div>
  )
}

