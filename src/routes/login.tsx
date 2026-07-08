import { LoginForm } from "@/components/login-form"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return (
    <main className="m-4 mt-24 flex justify-center">
      <div className="w-full max-w-lg">
        <LoginForm redirectPath={redirect} />
      </div>
    </main>
  )
}
