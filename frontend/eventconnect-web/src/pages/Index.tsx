import { useState, useMemo, useEffect } from "react";
import EventCard from "@/components/EventCard";
import CategoryChips from "@/components/CategoryChips";
import SearchInput from "@/components/SearchInput";
import { Sparkles } from "lucide-react";

export default function Index() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    let filteredEvents = events;
    if (category !== "All") {
      filteredEvents = filteredEvents.filter((e) => e.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.location_name && e.location_name.toLowerCase().includes(q))
      );
    }
    return filteredEvents;
  }, [category, search, events]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background px-4 py-12 md:py-16">
        <div className="container">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Discover what's happening</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Find events that<br />
            <span className="text-gradient">inspire you</span>
          </h1>
          <p className="mb-8 max-w-lg text-base text-muted-foreground">
            Explore curated events near you — from music festivals to tech meetups, food markets and beyond.
          </p>
          <div className="max-w-xl">
            <SearchInput value={search} onChange={setSearch} />
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="container py-8">
        <CategoryChips selected={category} onSelect={setCategory} />

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading events...</div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((event, i) => (
                <div key={event.event_id || event.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <EventCard event={{
                    id: event.event_id,
                    title: event.title,
                    image: event.image || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop",
                    category: event.category || "General",
                    date: event.start_time,
                    time: new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    location: event.location_name || "TBD",
                    rsvpCount: event.rsvp_count || 0,
                    attendees: []
                  }} />
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-lg text-muted-foreground">No events found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a different category or search term</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
