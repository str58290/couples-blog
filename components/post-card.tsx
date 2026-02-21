'use client'

import { format } from 'date-fns'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    image_url: string | null
    created_at: string
    author_name: string
    user_id: string
  }
  currentUserId: string
  onDelete: (postId: string) => void
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const isOwnPost = post.user_id === currentUserId
  const formattedDate = format(new Date(post.created_at), 'MMMM d, yyyy')
  const formattedTime = format(new Date(post.created_at), 'h:mm a')

  return (
    <article className="group relative bg-card rounded-xl border border-border p-6 transition-all hover:shadow-sm">
      {/* Author & Date Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              post.author_name === 'Tai Rong'
                ? 'bg-accent/15 text-accent'
                : 'bg-primary/15 text-primary'
            }`}
          >
            {post.author_name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {post.author_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formattedDate} at {formattedTime}
            </p>
          </div>
        </div>

        {isOwnPost && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete post</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This post will be permanently
                  removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(post.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Title */}
      <h2 className="text-xl font-serif font-medium text-foreground mb-3 text-pretty">
        {post.title}
      </h2>

      {/* Content */}
      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mb-4">
        {post.content}
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative w-full overflow-hidden rounded-lg border border-border">
          <Image
            src={post.image_url}
            alt={`Photo shared by ${post.author_name}`}
            width={800}
            height={500}
            className="w-full h-auto object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      )}
    </article>
  )
}
