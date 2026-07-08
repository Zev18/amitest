import { SignupForm } from "@/components/signup-form"
import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

const signupSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
  validateSearch: signupSearchSchema,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return (
    <main className="m-4 mt-24 flex justify-center">
      <div className="w-full max-w-lg">
        <SignupForm redirectPath={redirect} />
      </div>
    </main>
  )
}
