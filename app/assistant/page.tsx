"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const SUGGESTED_PROMPTS = [
  "What are some good exercises for seniors?",
  "Can you suggest a healthy recipe?",
  "Tell me about staying socially active",
  "How can I improve my memory?",
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AssistantPage() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call the Express proxy server
      const systemPrompt = "You are a helpful, patient, and friendly AI assistant for elderly people. Use clear, simple language and be very supportive. Encourage them to stay active and connected with their friends."

      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${systemPrompt}\n\nUser: ${text}`
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`API Error: ${response.status} - ${errorData.error || 'Failed to get response'}`)
      }

      const data = await response.json()
      const aiText = data.text || 'Sorry, I couldn\'t generate a response.'

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error with proxy server:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please make sure the proxy server is running on port 3001.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestedPrompt = (prompt: string) => {
    if (isLoading) return
    sendMessage(prompt)
  }

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="max-w-screen-lg mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Your helpful companion</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-lg mx-auto w-full p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 py-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
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
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                />
              </svg>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-balance">Hello! How can I help you today?</h2>
              <p className="text-lg text-muted-foreground text-balance max-w-md">
                I'm here to answer questions, offer advice, and have friendly conversations.
              </p>
            </div>

            <div className="w-full max-w-2xl space-y-3">
              <p className="text-center font-semibold text-lg">Try asking me about:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-4 px-6 text-left justify-start text-lg font-medium hover:bg-primary/5 hover:border-primary transition-colors bg-transparent"
                    onClick={() => handleSuggestedPrompt(prompt)}
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 mr-3 text-primary shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                      />
                    </svg>
                    <span className="text-balance">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex gap-4", message.role === "user" ? "justify-end" : "")}>
                {message.role === "assistant" && (
                  <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
                    <AvatarFallback className="bg-transparent text-primary font-bold">AI</AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={cn(
                    "max-w-[85%] shadow-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border",
                  )}
                >
                  <CardContent className="p-4">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </CardContent>
                </Card>
                {message.role === "user" && (
                  <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">Me</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <AvatarFallback className="bg-transparent text-primary font-bold">AI</AvatarFallback>
                </Avatar>
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <div className="border-t border-border bg-card p-4 sticky bottom-20 z-40">
        <form onSubmit={handleSubmit} className="max-w-screen-lg mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1 h-16 px-6 text-xl rounded-2xl border-2 border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-16 w-16 rounded-2xl shadow-lg shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
