import { useParams, Link } from "react-router-dom";
import { mockEvents } from "@/data/mockEvents";
import { MapPin, Clock, Users, ArrowLeft, Share2, Heart } from "lucide-react";
import { useRsvp } from "@/hooks/useRsvp";
import RsvpButtons from "@/components/RsvpButtons";
import RsvpBadge from "@/components/RsvpBadge";
import { toast } from "@/hooks/use-toast";

export default function EventDetails() {
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === id);
  const { status, loading, setRsvp } = useRsvp(id || "");

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const displayCount = event.rsvpCount + (status === "going" ? 1 : 0);

  const handleRsvp = async (newStatus: "going" | "interested" | "not_going") => {
    const result = await setRsvp(newStatus);
    const labels = { going: "Going", interested: "Interested", not_going: "Not Going", none: "" };
    toast({
      title: result === "none" ? "RSVP removed" : `You're ${labels[result]}!`,
      description: result === "none" ? "Your RSVP has been cleared." : `Your status for ${event.title} has been updated.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground transition-colors hover:bg-background"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="absolute right-4 top-4 flex gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground transition-colors hover:bg-background">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground transition-colors hover:bg-background hover:text-primary">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container -mt-16 relative z-10 pb-12">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
            {event.category}
          </span>
          <RsvpBadge status={status} />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">{event.title}</h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {event.time}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm text-foreground">
            <Users className="h-4 w-4 text-primary" />
            {displayCount} / {event.capacity}
          </div>
        </div>

        {/* RSVP Section */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Your RSVP</h2>
          <RsvpButtons status={status} loading={loading} onRsvp={handleRsvp} />
          {status !== "none" && (
            <p className="mt-3 text-xs text-muted-foreground animate-fade-in">
              {status === "going" && "🎉 You're on the list! See you there."}
              {status === "interested" && "⭐ We'll keep you updated on this event."}
              {status === "not_going" && "No worries — check out other events!"}
            </p>
          )}
        </div>

        {/* Host */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <img src={event.host.avatar} alt={event.host.name} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="text-xs text-muted-foreground">Hosted by</p>
            <p className="font-semibold text-foreground">{event.host.name}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">About this event</h2>
          <p className="leading-relaxed text-muted-foreground">{event.description}</p>
        </div>

        {/* Attendees Preview */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Attendees</h2>
            <Link to={`/events/${event.id}/attendees`} className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {event.attendees.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-lg bg-card px-3 py-2">
                <img src={a.avatar} alt={a.name} className="h-8 w-8 rounded-full object-cover" />
                <span className="text-sm text-foreground">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
