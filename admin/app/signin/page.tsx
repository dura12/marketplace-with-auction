import type { Metadata } from "next"
import SignInClient from "./signin-client"

export const metadata: Metadata = {
  title: "Sign-In - Marketplace Admin",
  description: "Sign in to access the platform",
}

const SignInPage = () => {
  return (
    <div>
      <SignInClient/>
    </div>
  )
}

export default SignInPage
