import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/$quizId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/quiz/$quizId/"!</div>
}
