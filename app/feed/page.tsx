"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Post {
  id: string
  user: {
    name: string
    avatar: string
  }
  content: string
  image?: string
  video?: string
  likes: number
  comments: number
  time: string
  isLiked?: boolean
}

const initialPosts: Post[] = [
  {
    id: "1",
    user: { name: "Sarah Miller", avatar: "/placeholder.svg?key=10" },
    content: "Beautiful morning in the garden! The roses are finally blooming.",
    image: "/colorful-garden-flowers.png",
    likes: 12,
    comments: 2,
    time: "1h ago",
  },
  {
    id: "2",
    user: { name: "James Wilson", avatar: "/placeholder.svg?key=11" },
    content: "Check out this video from our family reunion last weekend!",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    likes: 24,
    comments: 5,
    time: "3h ago",
  },
  {
    id: "3",
    user: { name: "Betty White", avatar: "/placeholder.svg?key=12" },
    content: "Made some fresh apple pie today. Come over if you want a slice!",
    image: "/classic-apple-pie.png",
    likes: 45,
    comments: 10,
    time: "5h ago",
  },
]

export default function FeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [newPostContent, setNewPostContent] = useState("")

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post,
      ),
    )
  }

  const handlePost = () => {
    if (!newPostContent.trim()) return
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const post: Post = {
      id: Math.random().toString(36).substr(2, 9),
      user: { name: user.name || "Me", avatar: user.avatar || "/placeholder.svg" },
      content: newPostContent,
      likes: 0,
      comments: 0,
      time: "Just now",
    }
    setPosts([post, ...posts])
    setNewPostContent("")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="max-w-screen-md mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Family & Friends Feed</h1>
          <Button size="icon" variant="ghost" className="rounded-full h-12 w-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
          </Button>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-4 space-y-6">
        {/* Create Post Card */}
        <Card className="border-2 border-primary/20 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                <AvatarImage src="/placeholder.svg?key=me" />
                <AvatarFallback>Me</AvatarFallback>
              </Avatar>
              <textarea
                className="flex-1 bg-transparent border-none focus:ring-0 text-xl resize-none py-2 placeholder:text-muted-foreground/50"
                placeholder="What's on your mind?"
                rows={2}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center border-t border-border pt-4">
              <div className="flex gap-2">
                <Button variant="ghost" className="rounded-full gap-2 font-bold text-lg h-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  Photo
                </Button>
                <Button variant="ghost" className="rounded-full gap-2 font-bold text-lg h-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-secondary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                  Video
                </Button>
              </div>
              <Button
                onClick={handlePost}
                disabled={!newPostContent.trim()}
                className="rounded-full px-8 h-12 font-bold text-lg"
              >
                Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="border-2 border-border shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-14 w-14 border-2 border-primary/10">
                  <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-xl leading-tight">{post.user.name}</p>
                  <p className="text-sm text-muted-foreground">{post.time}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <p className="px-4 text-xl leading-relaxed">{post.content}</p>

                {post.image && (
                  <div className="relative aspect-video w-full bg-muted overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post content"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {post.video && (
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    <video controls className="w-full h-full">
                      <source src={post.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 flex justify-between border-t border-border mt-2">
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      "rounded-full gap-3 font-bold text-lg h-14 px-6",
                      post.isLiked && "text-destructive hover:text-destructive",
                    )}
                    onClick={() => handleLike(post.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={post.isLiked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                    {post.likes > 0 && post.likes}
                    <span className="sr-only">Like</span>
                  </Button>
                  <Button variant="ghost" size="lg" className="rounded-full gap-3 font-bold text-lg h-14 px-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785c-.442.483.088 1.231.696 1.056a11.64 11.64 0 0 0 2.368-.748c.59-.263 1.214-.23 1.81.048a8.878 8.878 0 0 0 4.19 1.048Z"
                      />
                    </svg>
                    {post.comments > 0 && post.comments}
                    <span className="sr-only">Comment</span>
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-14 w-14">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                    />
                  </svg>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
