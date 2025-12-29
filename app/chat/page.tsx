"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FriendRequest {
  id: string
  name: string
  avatar: string
  time: string
}

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: boolean
}

const initialRequests: FriendRequest[] = [
  { id: "1", name: "Martha Stewart", avatar: "/placeholder.svg?key=1", time: "2h ago" },
  { id: "2", name: "Robert De Niro", avatar: "/placeholder.svg?key=2", time: "1d ago" },
]

const initialChats: Chat[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?key=3",
    lastMessage: "See you at the park tomorrow!",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: "2",
    name: "Grandkids Group",
    avatar: "/placeholder.svg?key=4",
    lastMessage: "Happy Birthday Grandpa!",
    time: "Yesterday",
  },
  {
    id: "3",
    name: "David Wilson",
    avatar: "/placeholder.svg?key=5",
    lastMessage: "How was your doctor appointment?",
    time: "Monday",
  },
]

export default function ChatPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<FriendRequest[]>(initialRequests)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  const handleAcceptRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  const handleDeleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-bold text-primary">Friends & Messages</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto p-4 space-y-6">
        {/* Friend Requests Section - Prominently at the top */}
        {requests.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              New Friend Requests
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-2 border-primary/20 shadow-sm overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/10">
                        <AvatarImage src={request.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{request.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{request.name}</p>
                        <p className="text-sm text-muted-foreground">{request.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="rounded-full font-bold px-6 h-12"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleDeleteRequest(request.id)}
                        className="rounded-full font-bold h-12 border-2"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Chat List and Chat Window */}
        <section className="bg-card rounded-3xl border-2 border-border shadow-md overflow-hidden min-h-[500px] flex flex-col md:flex-row">
          {/* Chat List */}
          <div
            className={cn(
              "w-full md:w-80 border-r border-border flex flex-col",
              activeChat ? "hidden md:flex" : "flex",
            )}
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold">Recent Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={cn(
                    "w-full p-4 flex items-center gap-4 border-b border-border transition-colors hover:bg-muted/50 text-left",
                    activeChat?.id === chat.id && "bg-primary/5",
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                      <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    {chat.unread && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-lg truncate">{chat.name}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.time}</span>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate",
                        chat.unread ? "font-bold text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Window */}
          <div
            className={cn(
              "flex-1 flex flex-col bg-background/50",
              !activeChat ? "hidden md:flex items-center justify-center p-12 text-center" : "flex",
            )}
          >
            {activeChat ? (
              <>
                <div className="p-4 border-b border-border bg-card flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveChat(null)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-8 h-8"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </Button>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={activeChat.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg leading-none">{activeChat.name}</p>
                    <p className="text-xs text-primary font-semibold mt-1">Online</p>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px:32px] opacity-20">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-4 rounded-3xl rounded-tr-none max-w-[80%] shadow-md">
                      <p className="text-lg font-medium">Hello! How are you doing today?</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-card border-2 border-border p-4 rounded-3xl rounded-tl-none max-w-[80%] shadow-sm">
                      <p className="text-lg font-medium">{activeChat.lastMessage}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-card border-t border-border">
                  <div className="flex gap-3 max-w-screen-lg mx-auto">
                    <Input
                      placeholder="Type your message..."
                      className="h-14 text-lg rounded-2xl border-2 focus-visible:ring-primary px-6"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && setMessage("")}
                    />
                    <Button className="h-14 w-14 rounded-full shadow-lg shrink-0" onClick={() => setMessage("")}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-7 h-7"
                      >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L10.301 21l4.75-4.75h2.449c1.584 0 2.708-1.394 2.708-3.003V5.25c0-1.61-1.124-3.003-2.708-3.003H5.25c-1.584 0-2.708 1.394-2.708 3.003v7.51Z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Pick a friend to chat with</h3>
                <p className="text-muted-foreground text-lg">Click on a name on the left to start a conversation</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
