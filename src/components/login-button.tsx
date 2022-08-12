import { useSession, signIn, signOut } from "next-auth/react"

export default function LoginButton() {
  const { data: session } = useSession()

  if (session?.user) {
    return (
      <>
        {session.user.name}
        <button className="btn btn-sm" onClick={() => signOut()}>
          Sign out
        </button>
      </>
    )
  }
  return (
    <>
      <button className="btn btn-sm" onClick={() => signIn()}>
        Sign in
      </button>
      to start posting
    </>
  )
}
