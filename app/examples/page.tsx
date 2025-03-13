"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Define example equations with their details
const exampleEquations = [
  {
    id: "harmonic",
    title: "Simple Harmonic Oscillator",
    description: "Second-order linear differential equation",
    equation: "d^2x/dt^2 + ω^2*x = 0",
    explanation: "Describes the motion of a mass on a spring when displaced from its equilibrium position.",
    variables: ["x"],
    parameters: [{ name: "ω", value: 1.0 }],
    initialConditions: [
      { variable: "x", value: 1.0, order: 0 },
      { variable: "v", value: 0.0, order: 0 },
    ],
  },
  {
    id: "logistic",
    title: "Logistic Growth",
    description: "First-order nonlinear differential equation",
    equation: "dP/dt = r*P*(1 - P/K)",
    explanation: "Models population growth with limited resources.",
    variables: ["P"],
    parameters: [
      { name: "r", value: 1.0 },
      { name: "K", value: 10.0 },
    ],
    initialConditions: [{ variable: "P", value: 0.5, order: 0 }],
  },
  {
    id: "pendulum",
    title: "Pendulum",
    description: "Second-order nonlinear differential equation",
    equation: "d^2θ/dt^2 + (g/L)*sin(θ) = 0",
    explanation: "Describes the motion of a simple pendulum.",
    variables: ["θ"],
    parameters: [
      { name: "g", value: 9.8 },
      { name: "L", value: 1.0 },
    ],
    initialConditions: [
      { variable: "θ", value: 0.5, order: 0 },
      { variable: "ω", value: 0.0, order: 0 },
    ],
  },
  {
    id: "lotka-volterra",
    title: "Lotka-Volterra",
    description: "System of first-order nonlinear differential equations",
    equation: "dx/dt = α*x - β*x*y\ndy/dt = δ*x*y - γ*y",
    explanation: "Models predator-prey interactions in biological systems.",
    variables: ["x", "y"],
    parameters: [
      { name: "α", value: 1.0 },
      { name: "β", value: 0.1 },
      { name: "δ", value: 0.1 },
      { name: "γ", value: 1.0 },
    ],
    initialConditions: [
      { variable: "x", value: 10.0, order: 0 },
      { variable: "y", value: 5.0, order: 0 },
    ],
  },
]

export default function ExamplesPage() {
  const router = useRouter()

  // Function to handle "Try in Simulator" button click
  const handleTryInSimulator = (example: (typeof exampleEquations)[0]) => {
    // Store the example data in localStorage
    localStorage.setItem("selectedExample", JSON.stringify(example))

    // Navigate to the simulator page
    router.push("/simulator")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Example Differential Equations</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {exampleEquations.map((example) => (
          <Card key={example.id}>
            <CardHeader>
              <CardTitle>{example.title}</CardTitle>
              <CardDescription>{example.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <code>{example.equation}</code>
              </p>
              <p className="text-muted-foreground">{example.explanation}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleTryInSimulator(example)}>Try in Simulator</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

