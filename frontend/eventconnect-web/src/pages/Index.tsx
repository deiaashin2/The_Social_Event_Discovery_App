import { useState, useMemo, useEffect } from "react";
import EventCard from "@/components/EventCard";
import CategoryChips from "@/components/CategoryChips";
import SearchInput from "@/components/SearchInput";
import { Sparkles, TrendingUp, CalendarDays } from "lucide-react";

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

  const totalAttendees = mockEvents.reduce((sum, e) => sum + e.rsvpCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-4 py-14 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="container relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-primary/15 px-3 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Discover what's happening
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-6xl leading-[1.1]">
            Find events that<br />
            <span className="text-gradient">inspire you</span>
          </h1>
          <p className="mb-8 max-w-lg text-base text-muted-foreground leading-relaxed">
            Explore curated events near you — from music festivals to tech meetups, food markets and beyond.
          </p>
          <div className="max-w-xl mb-8">
            <SearchInput value={search} onChange={setSearch} />
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-lg bg-card/60 px-3 py-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{mockEvents.length}</span> events live
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/60 px-3 py-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{totalAttendees.toLocaleString()}</span> attending
            </div>
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Browse Events</h2>
          <span className="text-sm text-muted-foreground">{filtered.length} events</span>
        </div>

        <CategoryChips selected={category} onSelect={setCategory} />

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((event, i) => (
            <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <EventCard event={event} />
            </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-5 text-lg font-semibold text-foreground">No events found</p>
            <p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
              Try adjusting your filters or search for something else.
            </p>
            <button
              onClick={() => { setCategory("All"); setSearch(""); }}
              className="mt-4 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-surface-hover"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  ) : null}
}
