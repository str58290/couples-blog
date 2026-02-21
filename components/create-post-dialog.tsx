'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus, X, PenLine } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface CreatePostDialogProps {
  userId: string
  authorName: string
  onPostCreated: () => void
}

export function CreatePostDialog({
  userId,
  authorName,
  onPostCreated,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content.')
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl: string | null = null

      // Upload image if present
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          throw new Error(err.error || 'Image upload failed')
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      // Create post in Supabase
      const supabase = createClient()
      const { error } = await supabase.from('posts').insert({
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl,
        user_id: userId,
        author_name: authorName,
      })

      if (error) {
        console.error('Supabase error creating post:', error)
        throw error
      }

      toast.success('Post published!')
      setTitle('')
      setContent('')
      removeImage()
      setOpen(false)
      onPostCreated()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create post'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PenLine className="h-4 w-4" />
          Write a Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            New Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 font-serif"
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Your message
            </Label>
            <Textarea
              id="content"
              placeholder="Write something from the heart..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[160px] resize-none leading-relaxed"
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/5000
            </p>
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Photo (optional)</Label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors cursor-pointer"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-sm">Click to add a photo</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="h-11">
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
