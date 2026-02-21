import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          <Heart className="h-10 w-10 text-accent" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-serif font-medium text-foreground">
              Check Your Email
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed text-balance">
              {"We've sent you a confirmation link. Please check your email to verify your account, then come back to sign in."}
            </p>
          </div>
          <Link
            href="/auth/login"
            className="text-sm text-foreground underline underline-offset-4 hover:text-accent transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
