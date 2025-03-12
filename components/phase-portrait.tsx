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

    // For phase portrait, we need at least 2 variables
    const trace = {
      x: solution.y.map((y) => y[0]),
      y: solution.y.map((y) => y[1]),
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
      },
      yaxis: {
        title: state.variables[1].name,
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

