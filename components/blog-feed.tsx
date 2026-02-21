'use client'

import { useCallback, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostCard } from '@/components/post-card'
import { CreatePostDialog } from '@/components/create-post-dialog'
import { PostTimeline } from '@/components/post-timeline'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useSWR from 'swr'
import { format, isSameDay, isToday, isYesterday } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface BlogFeedProps {
  userId: string
  displayName: string
}

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  author_name: string
  user_id: string
}

async function fetchPosts(): Promise<Post[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export function BlogFeed({ userId, displayName }: BlogFeedProps) {
  const [authorFilter, setAuthorFilter] = useState<'all' | 'Tai Rong' | 'Maeko'>('all')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { data: posts, error, mutate } = useSWR('posts', fetchPosts, {
    refreshInterval: 15000,
  })

  const filteredPosts =
    posts?.filter((post) => {
      const matchesAuthor = authorFilter === 'all' || post.author_name === authorFilter
      const matchesDate = selectedDate === null || isSameDay(new Date(post.created_at), new Date(selectedDate + 'T00:00:00'))
      return matchesAuthor && matchesDate
    }) ?? []

  const handleDelete = useCallback(
    async (postId: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) {
        toast.error('Failed to delete post')
        return
      }
      toast.success('Post deleted')
      mutate()
    },
    [mutate]
  )

  const isLoading = !posts && !error

  // Compute unique dates for the mobile horizontal scroller
  const uniqueDates = useMemo(() => {
    if (!posts) return []
    const seen = new Map<string, { key: string; label: string; count: number }>()
    for (const post of posts) {
      const d = new Date(post.created_at)
      const key = format(d, 'yyyy-MM-dd')
      if (!seen.has(key)) {
        let label = format(d, 'MMM d')
        if (isToday(d)) label = 'Today'
        else if (isYesterday(d)) label = 'Yesterday'
        seen.set(key, { key, label, count: 1 })
      } else {
        seen.get(key)!.count++
      }
    }
    return Array.from(seen.values())
  }, [posts])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex gap-8">
        {/* Timeline sidebar */}
        <aside className="shrink-0 w-64 hidden lg:block">
          <div className="sticky top-20">
            <PostTimeline
              posts={posts ?? []}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {/* Toolbar */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile sidebar trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden text-muted-foreground hover:text-foreground"
                    >
                      <PanelLeft className="h-4 w-4" />
                      <span className="sr-only">Open timeline</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="font-serif text-xl">Timeline</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto h-full pr-2 pb-10">
                      <PostTimeline
                        posts={posts ?? []}
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                          setSelectedDate(date)
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <Tabs
                  value={authorFilter}
                  onValueChange={(v) => setAuthorFilter(v as typeof authorFilter)}
                >
                  <TabsList>
                    <TabsTrigger value="all">All Posts</TabsTrigger>
                    <TabsTrigger value="Tai Rong">Tai Rong</TabsTrigger>
                    <TabsTrigger value="Maeko">Maeko</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <CreatePostDialog
                userId={userId}
                authorName={displayName}
                onPostCreated={() => mutate()}
              />
            </div>

            {/* Mobile date scroller (shown on smaller screens) */}
            {uniqueDates.length > 0 && (
              <div className="lg:hidden -mx-4 px-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${selectedDate === null
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    All
                  </button>
                  {uniqueDates.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDate(selectedDate === d.key ? null : d.key)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${selectedDate === d.key
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {d.label}
                      <span className="ml-1 opacity-60">{d.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active date filter badge */}
            {selectedDate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Showing posts from
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                  {format(new Date(selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="ml-1 hover:text-accent transition-colors cursor-pointer"
                    aria-label="Clear date filter"
                  >
                    &times;
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Posts */}
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border p-6 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-3/4 bg-muted rounded mb-3" />
                  <div className="h-4 w-full bg-muted rounded mb-2" />
                  <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-sm text-destructive">
                Failed to load posts. Please try refreshing.
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-serif font-medium text-foreground mb-1">
                {selectedDate
                  ? 'No posts on this date'
                  : authorFilter === 'all'
                    ? 'No posts yet'
                    : `No posts from ${authorFilter} yet`}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs text-balance">
                {selectedDate
                  ? 'Try selecting a different date from the timeline.'
                  : authorFilter === 'all'
                    ? 'Be the first to write something. Your words will appear here.'
                    : `When ${authorFilter} writes something, it will show up here.`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={userId}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div >
  )
}
