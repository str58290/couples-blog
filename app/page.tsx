import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BlogHeader } from '@/components/blog-header'
import { BlogFeed } from '@/components/blog-feed'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get display name from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || user.user_metadata?.display_name || 'Unknown'

  return (
    <div className="min-h-svh bg-background">
      <BlogHeader displayName={displayName} />
      <main>
        <BlogFeed userId={user.id} displayName={displayName} />
      </main>
    </div>
  )
}
