import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Visualize Differential Equations
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                An elegant, interactive tool for solving and visualizing differential equations in your browser.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/simulator">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/examples">
                <Button variant="outline" size="lg">
                  View Examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Powerful Simulation Engine</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Solve ordinary differential equations with various numerical methods including Euler, Runge-Kutta, and
                more.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Beautiful Visualizations</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Visualize solutions with interactive plots, phase portraits, and vector fields to gain deeper insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <CardTitle>Interactive</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Adjust parameters in real-time and see how solutions change dynamically.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Educational</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Learn about differential equations through interactive examples and tutorials.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shareable</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Save and share your simulations with others for collaboration and learning.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

