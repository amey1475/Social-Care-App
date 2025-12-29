"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
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
  lat: number
  lng: number
  type: "social" | "fitness" | "learning"
}

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Morning Walk",
    location: "City Park",
    time: "8:00 AM",
    participants: 4,
    lat: 40.7829,
    lng: -73.9654,
    type: "fitness",
  },
  {
    id: "2",
    title: "Book Club",
    location: "Library",
    time: "10:30 AM",
    participants: 8,
    lat: 40.7505,
    lng: -73.9934,
    type: "learning",
  },
  {
    id: "3",
    title: "Coffee Meetup",
    location: "Sunny Cafe",
    time: "2:00 PM",
    participants: 12,
    lat: 40.7282,
    lng: -73.7949,
    type: "social",
  },
]

export default function HomePage() {
  // Dynamically import map components inside the component to avoid SSR issues
  const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
  const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
  const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
  const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", location: "", time: "", lat: 0, lng: 0 })
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    // Get user's location - only on client side
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fallback to default location
          setUserLocation([40.7128, -74.0060])
        }
      )
    } else {
      // Fallback if geolocation not supported
      setUserLocation([40.7128, -74.0060])
    }
  }, [])

  useEffect(() => {
    // Load Leaflet CSS on client side only
    if (typeof window !== 'undefined') {
      import("leaflet/dist/leaflet.css")
    }
  }, [])

  useEffect(() => {
    // Fix for default marker icon in Next.js - only on client side
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })
      })
    }
  }, [])

  const handleJoinEvent = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, participants: e.participants + 1 } : e)))
    setSelectedEvent(null)
  }

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 3 || query.endsWith(' ')) {
      setLocationSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLocationLoading(true)
    try {
      // Create a bounding box around user's location (approximately 50km radius)
      let apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      
      if (userLocation) {
        const [userLng, userLat] = userLocation
        // Create a bounding box approximately 50km around user location
        const delta = 0.45 // Roughly 50km in degrees
        const minLon = userLng - delta
        const maxLon = userLng + delta
        const minLat = userLat - delta
        const maxLat = userLat + delta
        
        apiUrl += `&viewbox=${minLon},${minLat},${maxLon},${maxLat}&bounded=1`
      }

      const response = await fetch(apiUrl)
      const data = await response.json()
      setLocationSuggestions(data)
      setShowSuggestions(data.length > 0)
    } catch (error) {
      console.error('Error searching locations:', error)
      setLocationSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLocationLoading(false)
    }
  }, [])

  // Simple debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }

  const debouncedSearch = useCallback(
    debounce((query: string) => searchLocations(query), 300),
    [searchLocations]
  )

  const handleLocationSelect = (suggestion: any) => {
    setNewEvent({
      ...newEvent,
      location: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    })
    setShowSuggestions(false)
    setLocationSuggestions([])
  }

  const handleLocationInputChange = (value: string) => {
    setNewEvent({ ...newEvent, location: value })
    // Don't show suggestions if the last character is a space or if input is too short
    if (value.length >= 3 && !value.endsWith(' ')) {
      debouncedSearch(value)
    } else {
      setShowSuggestions(false)
      setLocationSuggestions([])
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddingEvent(open)
    if (!open) {
      // Reset form and suggestions when dialog closes
      setNewEvent({ title: "", location: "", time: "", lat: 0, lng: 0 })
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (newEvent.lat === 0 && newEvent.lng === 0) {
      alert("Please select a location on the map")
      return
    }
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      location: newEvent.location,
      time: newEvent.time,
      participants: 1,
      lat: newEvent.lat,
      lng: newEvent.lng,
      type: "social",
    }
    setEvents([...events, event])
    setIsAddingEvent(false)
    setNewEvent({ title: "", location: "", time: "", lat: 0, lng: 0 })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-bold text-primary">Local Activities</h1>
          <Dialog open={isAddingEvent} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 text-lg rounded-full shadow-md font-bold">+ Add Activity</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Start a New Activity</DialogTitle>
                <DialogDescription className="text-lg">
                  Invite your friends to join you for something fun!
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEvent} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
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
                    <div className="relative">
                      <Input
                        id="location"
                        placeholder="e.g. Community Center, Park"
                        value={newEvent.location}
                        onChange={(e) => handleLocationInputChange(e.target.value)}
                        onFocus={() => {
                          if (locationSuggestions.length > 0) {
                            setShowSuggestions(true)
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding to allow clicks on suggestions
                          setTimeout(() => setShowSuggestions(false), 200)
                        }}
                        className="h-12 text-lg"
                        required
                      />
                      {isLocationLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-[1300] bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {locationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                              onClick={() => handleLocationSelect(suggestion)}
                              onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                            >
                              <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {suggestion.display_name}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                  <Button type="submit" className="w-full h-14 text-xl font-bold mt-4" disabled={newEvent.lat === 0 && newEvent.lng === 0}>
                    Create Activity
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">
                    Select Location on Map
                  </Label>
                  <div className="h-80 w-full rounded-lg overflow-hidden border relative z-[1200]">
                    <MapContainer
                      center={userLocation || [40.7128, -74.0060]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      eventHandlers={{
                        click: (e) => {
                          console.log('Map clicked:', e.latlng)
                          setNewEvent({ ...newEvent, lat: e.latlng.lat, lng: e.latlng.lng })
                        }
                      }}
                    >
                      <TileLayer
                        url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
                        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {userLocation && (
                        <Marker position={userLocation}>
                          <Popup>You are here!</Popup>
                        </Marker>
                      )}
                      {newEvent.lat !== 0 && newEvent.lng !== 0 && (
                        <Marker position={[newEvent.lat, newEvent.lng]}>
                          <Popup>Selected location for activity</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {newEvent.lat !== 0 && newEvent.lng !== 0 
                      ? `Selected: ${newEvent.lat.toFixed(4)}, ${newEvent.lng.toFixed(4)}` 
                      : "Click on the map to select the activity location"}
                  </p>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-4 max-w-screen-xl mx-auto space-y-6">
        {/* Map */}
        <div className="relative w-full aspect-[4/3] bg-secondary/20 rounded-3xl border-2 border-primary/20 overflow-hidden shadow-inner">


          <MapContainer
            center={userLocation || [40.7128, -74.0060]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            className="rounded-3xl"
          >
            <TileLayer
              url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
              attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>You are here!</Popup>
              </Marker>
            )}
            {events.map((event) => (
              <Marker
                key={event.id}
                position={[event.lat, event.lng]}
                eventHandlers={{
                  click: () => setSelectedEvent(event),
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold">{event.title}</h3>
                    <p>{event.location}</p>
                    <p>{event.time}</p>
                    <p>{event.participants} participants</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>


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
