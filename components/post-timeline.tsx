'use client'

import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { Calendar } from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  author_name: string
  user_id: string
}

interface PostTimelineProps {
  posts: Post[]
  onSelectDate: (date: string | null) => void
  selectedDate: string | null
}

interface DayGroup {
  date: Date
  label: string
  posts: { id: string; author_name: string; title: string; time: string }[]
}

function groupPostsByDay(posts: Post[]): DayGroup[] {
  const groups: Map<string, DayGroup> = new Map()

  for (const post of posts) {
    const date = new Date(post.created_at)
    const dayKey = format(date, 'yyyy-MM-dd')

    if (!groups.has(dayKey)) {
      let label = format(date, 'EEEE, MMMM d')
      if (isToday(date)) label = 'Today'
      else if (isYesterday(date)) label = 'Yesterday'

      groups.set(dayKey, {
        date,
        label,
        posts: [],
      })
    }

    groups.get(dayKey)!.posts.push({
      id: post.id,
      author_name: post.author_name,
      title: post.title,
      time: format(date, 'h:mm a'),
    })
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )
}

export function PostTimeline({ posts, onSelectDate, selectedDate }: PostTimelineProps) {
  const groups = groupPostsByDay(posts)

  if (groups.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-3 pb-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
          Timeline
        </span>
      </div>

      {/* "All" button */}
      <button
        onClick={() => onSelectDate(null)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
          selectedDate === null
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className={`h-2 w-2 rounded-full ${
            selectedDate === null ? 'bg-accent' : 'bg-muted-foreground/40'
          }`} />
        </div>
        <span className="font-medium">All Dates</span>
      </button>

      {/* Date groups */}
      <div className="relative ml-[18px] border-l border-border/60">
        {groups.map((group, groupIndex) => {
          const dayKey = format(group.date, 'yyyy-MM-dd')
          const isSelected = selectedDate === dayKey
          const isLast = groupIndex === groups.length - 1

          return (
            <div key={dayKey} className={`relative ${isLast ? '' : 'pb-1'}`}>
              {/* Date node */}
              <button
                onClick={() => onSelectDate(isSelected ? null : dayKey)}
                className={`group flex w-full items-start gap-3 py-2 pr-3 pl-4 text-left transition-colors cursor-pointer rounded-r-lg ${
                  isSelected
                    ? 'bg-secondary/80'
                    : 'hover:bg-secondary/40'
                }`}
              >
                {/* Dot on the timeline line */}
                <div className="absolute -left-[5px] top-[18px]">
                  <div className={`h-[10px] w-[10px] rounded-full border-2 transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent'
                      : 'border-muted-foreground/40 bg-background group-hover:border-accent/60'
                  }`} />
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className={`text-xs font-semibold tracking-tight ${
                    isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}>
                    {group.label}
                  </span>

                  {/* Post indicators */}
                  <div className="flex flex-col gap-1">
                    {group.posts.map((post) => (
                      <div key={post.id} className="flex items-center gap-2 min-w-0">
                        <div
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            post.author_name === 'Tai Rong'
                              ? 'bg-accent/80'
                              : 'bg-primary/60'
                          }`}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                          {post.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
