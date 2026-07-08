// src/components/header.tsx
import { Link, useRouteContext } from "@tanstack/react-router"
import { Button } from "./ui/button"
import { authClient } from "@/lib/auth-client"
import type { FC } from "react"

export const Header: FC = () => {
  const { session } = useRouteContext({ from: "__root__" })

  const logout = async () => {
    await authClient.signOut()
    window.location.reload()
  }

  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="text-2xl font-bold">
        <Link to="/">Am I ____?</Link>
      </h1>
      <nav>
        {session ? (
          <Button onClick={logout}>Logout</Button>
        ) : (
          <Button
            nativeButton={false}
            render={<Link to="/login">Log in</Link>}
          />
        )}
      </nav>
    </header>
  )
}
