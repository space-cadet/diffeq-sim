"use client"

import { useEquation } from "@/context/equation-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Update the examples to use the correct notation for second derivatives
const examples = [
  {
    name: "Exponential Growth",
    equation: "dy/dt = r*y",
    variables: [{ name: "y" }],
    parameters: [{ name: "r", value: 0.5 }],
    initialConditions: [{ variable: "y", value: 1, order: 0 }],
    description: "Models exponential growth with rate r",
  },
  {
    name: "Logistic Growth",
    equation: "dy/dt = r*y*(1 - y/K)",
    variables: [{ name: "y" }],
    parameters: [
      { name: "r", value: 1.0 },
      { name: "K", value: 10.0 },
    ],
    initialConditions: [{ variable: "y", value: 0.5, order: 0 }],
    description: "Models population growth with carrying capacity K",
  },
  {
    name: "Harmonic Oscillator",
    equation: "d^2y/dt^2 = -k*y",
    variables: [{ name: "y" }, { name: "v" }],
    parameters: [{ name: "k", value: 1.0 }],
    initialConditions: [
      { variable: "y", value: 1.0, order: 0 },
      { variable: "v", value: 0.0, order: 0 },
    ],
    description: "Models a mass on a spring (position and velocity)",
  },
  {
    name: "Damped Oscillator",
    equation: "d^2y/dt^2 = -k*y - c*dy/dt",
    variables: [{ name: "y" }, { name: "v" }],
    parameters: [
      { name: "k", value: 1.0 },
      { name: "c", value: 0.2 },
    ],
    initialConditions: [
      { variable: "y", value: 1.0, order: 0 },
      { variable: "v", value: 0.0, order: 0 },
    ],
    description: "Models a damped mass on a spring",
  },
]

export function ExampleEquations() {
  const { dispatch } = useEquation()

  // Modify the loadExample function to update the input field
  const loadExample = (example: (typeof examples)[0]) => {
    // Reset state
    dispatch({ type: "RESET" })

    // Set equation
    dispatch({ type: "SET_EQUATION", payload: example.equation })

    // Set variables
    example.variables.forEach((variable) => {
      dispatch({
        type: "ADD_VARIABLE",
        payload: { name: variable.name },
      })
    })

    // Set parameters
    example.parameters.forEach((param) => {
      dispatch({
        type: "ADD_PARAMETER",
        payload: {
          name: param.name,
          value: param.value,
          min: -10,
          max: 10,
          step: 0.1,
        },
      })
    })

    // Set initial conditions
    example.initialConditions.forEach((ic) => {
      dispatch({
        type: "SET_INITIAL_CONDITION",
        payload: {
          variable: ic.variable,
          value: ic.value,
          order: ic.order,
        },
      })
    })

    // Force update the equation input field in the EquationInput component
    // This is done by dispatching a custom event that the EquationInput component will listen for
    const event = new CustomEvent("update-equation-input", {
      detail: { equation: example.equation },
    })
    window.dispatchEvent(event)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Equations</CardTitle>
        <CardDescription>Load predefined differential equations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examples.map((example) => (
            <Button
              key={example.name}
              variant="outline"
              className="h-auto py-4 justify-start flex-col items-start"
              onClick={() => loadExample(example)}
            >
              <div className="font-medium">{example.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{example.equation}</div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

