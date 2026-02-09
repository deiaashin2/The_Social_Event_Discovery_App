import { useParams, Link } from "react-router-dom";
import { mockEvents } from "@/data/mockEvents";
import { ArrowLeft } from "lucide-react";

export default function Attendees() {
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-4">
          <Link to={`/events/${id}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Attendees</h1>
            <p className="text-xs text-muted-foreground">{event.title}</p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <p className="mb-4 text-sm text-muted-foreground">{event.attendees.length} people attending</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {event.attendees.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-surface-hover">
              <img src={a.avatar} alt={a.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-medium text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">Attending</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
