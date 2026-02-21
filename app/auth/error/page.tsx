import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-serif font-medium text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {params?.error
                ? `Error: ${params.error}`
                : 'An unspecified error occurred.'}
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
