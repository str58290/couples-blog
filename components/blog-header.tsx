'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart, LogOut } from 'lucide-react'

interface BlogHeaderProps {
  displayName: string | null
}

export function BlogHeader({ displayName }: BlogHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <Heart className="h-5 w-5 text-accent fill-accent/30" />
          <h1 className="text-lg font-serif font-medium text-foreground tracking-tight">
            Our Journal
          </h1>
          <span className="text-xs text-muted-foreground hidden sm:inline-block ml-1">
            Tai Rong & Maeko
          </span>
        </div>

        <div className="flex items-center gap-4">
          {displayName && (
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {'Signed in as '}
              <span className="font-medium text-foreground">{displayName}</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
