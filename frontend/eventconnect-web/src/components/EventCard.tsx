import { Link } from "react-router-dom";
import { MapPin, Clock, Users } from "lucide-react";

interface EventCardProps {
  event: {
    event_id?: string | number;
    id?: string;
    ticketmaster_id?: string;
    title?: string;
    name?: string;
    image?: string;
    category?: string;
    start_time?: string;
    date?: string;
    time?: string;
    location_name?: string;
    location?: string;
    rsvpCount?: number;
    rsvp_count?: number;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const title = event.title || event.name || "Untitled Event";
  const image =
    event.image ||
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop";
  const location = event.location_name || event.location || "Location TBA";
  const rsvpCount = event.rsvpCount || event.rsvp_count || 0;

  let formattedDate = "Date TBA";
  let formattedTime = "Time TBA";

  if (event.start_time) {
    const start = new Date(event.start_time);

    if (!isNaN(start.getTime())) {
      formattedDate = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      formattedTime = start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }
  } else if (event.date) {
    const dateObj = new Date(event.date);

    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    formattedTime = event.time || "Time TBA";
  }

  const eventId = event.event_id || event.ticketmaster_id || event.id;

  return (
    <Link to={`/events/${eventId}`} className="group block">
      <div className="hover-lift overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

          {event.category && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                {event.category}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>

          <div className="mb-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                {formattedDate} · {formattedTime}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              <Users className="mr-1 inline h-3 w-3" />
              {rsvpCount} going
            </span>

            <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              RSVP
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}