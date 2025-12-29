"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  title: string
  location: string
  time: string
  participants: number
  x: number // simulated x coordinate on map
  y: number // simulated y coordinate on map
  type: "social" | "fitness" | "learning"
}

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Morning Walk",
    location: "City Park",
    time: "8:00 AM",
    participants: 4,
    x: 20,
    y: 30,
    type: "fitness",
  },
  {
    id: "2",
    title: "Book Club",
    location: "Library",
    time: "10:30 AM",
    participants: 8,
    x: 60,
    y: 45,
    type: "learning",
  },
  {
    id: "3",
    title: "Coffee Meetup",
    location: "Sunny Cafe",
    time: "2:00 PM",
    participants: 12,
    x: 45,
    y: 70,
    type: "social",
  },
]

export default function HomePage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", location: "", time: "" })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  const handleJoinEvent = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, participants: e.participants + 1 } : e)))
    setSelectedEvent(null)
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      location: newEvent.location,
      time: newEvent.time,
      participants: 1,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      type: "social",
    }
    setEvents([...events, event])
    setIsAddingEvent(false)
    setNewEvent({ title: "", location: "", time: "" })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-bold text-primary">Local Activities</h1>
          <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 text-lg rounded-full shadow-md font-bold">+ Add Activity</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Start a New Activity</DialogTitle>
                <DialogDescription className="text-lg">
                  Invite your friends to join you for something fun!
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEvent} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-lg font-semibold">
                    What is the activity?
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Garden Walk, Chess Match"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-lg font-semibold">
                    Where is it?
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Community Center, Park"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-lg font-semibold">
                    What time?
                  </Label>
                  <Input
                    id="time"
                    placeholder="e.g. Today at 3:00 PM"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-14 text-xl font-bold mt-4">
                  Create Activity
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-4 max-w-screen-xl mx-auto space-y-6">
        {/* Simulated Map */}
        <div className="relative w-full aspect-[4/3] bg-secondary/20 rounded-3xl border-2 border-primary/20 overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-white shadow-xl transition-all hover:scale-125 z-10",
                event.type === "fitness" ? "bg-chart-3" : event.type === "learning" ? "bg-chart-2" : "bg-chart-1",
              )}
              style={{ left: `${event.x}%`, top: `${event.y}%` }}
            >
              <div className="w-full h-full flex items-center justify-center text-white">
                {event.type === "fitness" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
                    />
                  </svg>
                ) : event.type === "learning" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 0 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0a5.995 5.995 0 0 0-4.058-2.932m0 0a5.995 5.995 0 0 0-4.058 2.932m0 0a5.971 5.971 0 0 0-.941 3.197m0 0a5.971 5.971 0 0 0 .941 3.197m0 0a5.971 5.971 0 0 0-.941-3.197m0 0a5.995 5.995 0 0 0-4.058-2.932m0 0a5.995 5.995 0 0 0-4.058 2.932m0 0a5.971 5.971 0 0 0-.941 3.197"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}

          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full inline-block text-sm font-semibold border border-primary/20 shadow-sm">
              Tap a circle on the map to see activity details
            </p>
          </div>
        </div>

        {/* Selected Event Details */}
        {selectedEvent ? (
          <Card className="border-2 border-primary shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">{selectedEvent.title}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(null)} className="h-10 w-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-secondary"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </div>
                <span className="font-semibold">{selectedEvent.location}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
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
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <span className="font-semibold">{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-chart-4/10 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-chart-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0a5.995 5.995 0 0 0-4.058-2.932m0 0a5.995 5.995 0 0 0-4.058 2.932m0 0a5.971 5.971 0 0 0-.941 3.197"
                    />
                  </svg>
                </div>
                <span className="font-semibold">{selectedEvent.participants} people are joining</span>
              </div>
              <Button
                onClick={() => handleJoinEvent(selectedEvent.id)}
                className="w-full h-14 text-xl font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
              >
                Count Me In!
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:border-primary transition-colors cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold text-white",
                        event.type === "fitness"
                          ? "bg-chart-3"
                          : event.type === "learning"
                            ? "bg-chart-2"
                            : "bg-chart-1",
                      )}
                    >
                      {event.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {event.location} • {event.time}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
