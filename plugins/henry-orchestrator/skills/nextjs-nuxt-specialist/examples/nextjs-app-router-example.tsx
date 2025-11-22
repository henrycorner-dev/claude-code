// Example: Next.js App Router with Server Components, Data Fetching, and Dynamic Routes
// This example demonstrates a complete blog post page with SSR, streaming, and error handling

// app/blog/[slug]/page.tsx

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Types
interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  publishedAt: string
  author: {
    name: string
    avatar: string
  }
  tags: string[]
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
}

// Data fetching functions
async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    // ISR: Revalidate every hour
    next: { revalidate: 3600 }
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch post')
  }

  return res.json()
}

async function getComments(postId: string): Promise<Comment[]> {
  // Slow query - will stream later
  const res = await fetch(`https://api.example.com/posts/${postId}/comments`, {
    cache: 'no-store' // Always fetch fresh comments
  })

  if (!res.ok) {
    throw new Error('Failed to fetch comments')
  }

  return res.json()
}

async function getRelatedPosts(tags: string[]): Promise<Post[]> {
  const res = await fetch(
    `https://api.example.com/posts?tags=${tags.join(',')}&limit=3`,
    {
      next: { revalidate: 3600 }
    }
  )

  if (!res.ok) {
    return [] // Return empty array on error for related posts
  }

  return res.json()
}

// Generate metadata for SEO
export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found'
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt
    }
  }
}

// Generate static params for SSG (optional)
export async function generateStaticParams() {
  const res = await fetch('https://api.example.com/posts')
  const posts: Post[] = await res.json()

  return posts.map((post) => ({
    slug: post.slug
  }))
}

// Server Component: Comments Section (will be streamed)
async function Comments({ postId }: { postId: string }) {
  const comments = await getComments(postId)

  return (
    <div className="comments">
      <h2 className="text-2xl font-bold mb-4">
        Comments ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p className="text-gray-500">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-gray-300 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{comment.author}</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Server Component: Related Posts
async function RelatedPosts({ tags }: { tags: string[] }) {
  const relatedPosts = await getRelatedPosts(tags)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="related-posts">
      <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedPosts.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            className="border rounded-lg p-4 hover:shadow-lg transition"
          >
            <h3 className="font-semibold mb-2">{post.title}</h3>
            <p className="text-sm text-gray-600">{post.excerpt}</p>
          </a>
        ))}
      </div>
    </div>
  )
}

// Loading skeletons
function CommentsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-l-2 border-gray-300 pl-4">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RelatedPostsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main page component
export default async function BlogPostPage({
  params
}: {
  params: { slug: string }
}) {
  // Fetch critical data (blocks render)
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Critical content - rendered immediately */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full"
            />
            <span>{post.author.name}</span>
          </div>

          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>

        <div className="flex gap-2 mt-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Post content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Non-critical content - streamed with Suspense */}
      <div className="border-t pt-8 space-y-12">
        <Suspense fallback={<CommentsSkeleton />}>
          <Comments postId={post.id} />
        </Suspense>

        <Suspense fallback={<RelatedPostsSkeleton />}>
          <RelatedPosts tags={post.tags} />
        </Suspense>
      </div>
    </article>
  )
}

// Error boundary for this route
export function ErrorBoundary() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-gray-600 mb-8">
        We encountered an error while loading this post.
      </p>
      <a
        href="/blog"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Back to Blog
      </a>
    </div>
  )
}

// Not found page
export function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
      <p className="text-gray-600 mb-8">
        The blog post you're looking for doesn't exist.
      </p>
      <a
        href="/blog"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Back to Blog
      </a>
    </div>
  )
}
