"use client"

import { useEffect, useRef } from "react"
import Plotly from "plotly.js-dist-min"
import { useEquation } from "@/context/equation-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PhasePortraitProps {
  solution: { t: number[]; y: number[][] } | null
}

export function PhasePortrait({ solution }: PhasePortraitProps) {
  const { state } = useEquation()
  const plotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plotRef.current || !solution || state.variables.length < 2) return

    // Handle complex numbers in phase portrait
    const isComplex = solution.y.some((y) => y.some((val) => typeof val === 'object' && val !== null && 're' in val))

    const trace = {
      x: solution.y.map((y) => isComplex ? Math.sqrt(y[0].re * y[0].re + y[0].im * y[0].im) : y[0]),
      y: solution.y.map((y) => isComplex ? Math.sqrt(y[1].re * y[1].re + y[1].im * y[1].im) : y[1]),
      type: "scatter",
      mode: "lines",
      name: `${state.variables[0].name} vs ${state.variables[1].name}`,
      line: {
        color: "rgba(50, 100, 200, 0.8)",
        width: 2,
      },
    }

    Plotly.newPlot(plotRef.current, [trace], {
      title: "Phase Portrait",
      xaxis: {
        title: state.variables[0].name,
        gridcolor: '#e0e0e0'
      },
      yaxis: {
        title: state.variables[1].name,
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

  if (!solution || state.variables.length < 2) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase Portrait</CardTitle>
        <CardDescription>Visualize the relationship between variables</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={plotRef} className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}

