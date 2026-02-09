import { useState, useMemo } from "react";
import { mockEvents } from "@/data/mockEvents";
import EventCard from "@/components/EventCard";
import CategoryChips from "@/components/CategoryChips";
import SearchInput from "@/components/SearchInput";
import { Sparkles } from "lucide-react";

export default function Index() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let events = mockEvents;
    if (category !== "All") {
      events = events.filter((e) => e.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }
    return events;
  }, [category, search]);

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

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((event, i) => (
            <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No events found</p>
            <p className="mt-1 text-sm text-text-tertiary">Try a different category or search term</p>
          </div>
        )}
      </section>
    </div>
  );
}
