import { Link } from "react-router-dom";
import { MapPin, Clock, Users } from "lucide-react";
import type { Event } from "@/data/mockEvents";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/events/${event.id}`} className="group block">
      <div className="hover-lift overflow-hidden rounded-xl border border-border bg-card">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
            {event.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <div className="mb-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {event.attendees.slice(0, 3).map((a) => (
                  <img
                    key={a.id}
                    src={a.avatar}
                    alt={a.name}
                    className="h-6 w-6 rounded-full border-2 border-card object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {event.rsvpCount} going
              </span>
            </div>
            <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              RSVP
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
