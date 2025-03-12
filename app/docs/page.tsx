import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Learn how to use the DiffEq Simulator for solving and visualizing differential equations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Numerical Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Understand the different numerical methods available for solving differential equations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input Format</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Learn how to properly format differential equations for the simulator.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualization Options</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Explore the different ways to visualize solutions to differential equations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Discover advanced features for complex differential equation systems.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Technical documentation for programmatic integration with the simulator.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

