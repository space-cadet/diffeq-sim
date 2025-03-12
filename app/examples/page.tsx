import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ExamplesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Example Differential Equations</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Simple Harmonic Oscillator</CardTitle>
            <CardDescription>Second-order linear differential equation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <code>d²x/dt² + ω²x = 0</code>
            </p>
            <p className="text-muted-foreground">
              Describes the motion of a mass on a spring when displaced from its equilibrium position.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/simulator">
              <Button>Try in Simulator</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logistic Growth</CardTitle>
            <CardDescription>First-order nonlinear differential equation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <code>dP/dt = rP(1 - P/K)</code>
            </p>
            <p className="text-muted-foreground">Models population growth with limited resources.</p>
          </CardContent>
          <CardFooter>
            <Link href="/simulator">
              <Button>Try in Simulator</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendulum</CardTitle>
            <CardDescription>Second-order nonlinear differential equation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <code>d²θ/dt² + (g/L)sin(θ) = 0</code>
            </p>
            <p className="text-muted-foreground">Describes the motion of a simple pendulum.</p>
          </CardContent>
          <CardFooter>
            <Link href="/simulator">
              <Button>Try in Simulator</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lotka-Volterra</CardTitle>
            <CardDescription>System of first-order nonlinear differential equations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <code>dx/dt = αx - βxy</code>
              <br />
              <code>dy/dt = δxy - γy</code>
            </p>
            <p className="text-muted-foreground">Models predator-prey interactions in biological systems.</p>
          </CardContent>
          <CardFooter>
            <Link href="/simulator">
              <Button>Try in Simulator</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

