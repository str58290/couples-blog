'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [displayName, setDisplayName] = useState<'Tai Rong' | 'Maeko' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!displayName) {
      setError('Please select who you are')
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/`,
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <Heart className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-serif font-medium text-foreground">
              Join Your Journal
            </h1>
            <p className="text-sm text-muted-foreground text-center text-balance">
              Create your account to start writing together
            </p>
          </div>

          <form onSubmit={handleSignUp} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Who are you?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDisplayName('Tai Rong')}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-all cursor-pointer',
                    displayName === 'Tai Rong'
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-accent/50'
                  )}
                >
                  <span className="text-lg font-serif font-medium">Tai Rong</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayName('Maeko')}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-all cursor-pointer',
                    displayName === 'Maeko'
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-accent/50'
                  )}
                >
                  <span className="text-lg font-serif font-medium">Maeko</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="repeat-password" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
