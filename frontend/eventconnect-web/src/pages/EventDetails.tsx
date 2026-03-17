import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, Users, ArrowLeft, Share2, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import RSVPButton from "@/components/RSVPButton";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [rsvped, setRsvped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendeeCount, setAttendeeCount] = useState(0);

  useEffect(() => {
    async function fetchEventAndStatus() {
      try {
        const res = await fetch(`/events/${id}`);
        if (!res.ok) throw new Error("Event not found");
        const eventData = await res.json();
        setEvent(eventData);
        setAttendeeCount(eventData.rsvp_count || 0);

        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (token && userData) {
          const user = JSON.parse(userData);
          const statusRes = await fetch(`/rsvp/${id}/status/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.status === "going") {
              setRsvped(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEventAndStatus();
  }, [id]);

  const handleStatusChange = (newStatus: boolean, newCount: number) => {
    setRsvped(newStatus);
    setAttendeeCount(newCount);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const eventImage = event.image || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop";
  const eventDate = new Date(event.start_time).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const eventTime = new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img src={eventImage} alt={event.title} className="h-full w-full object-cover" />
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
        <span className="mb-3 inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
          {event.category || "General"}
        </span>
        <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">{event.title}</h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            {eventDate} · {eventTime}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {event.location_name || "TBD"}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm text-foreground">
            <Users className="h-4 w-4 text-primary" />
            {attendeeCount} {event.capacity ? `/ ${event.capacity}` : ""}
          </div>
        </div>

        {/* Host (Using placeholder if not in DB) */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Host" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="text-xs text-muted-foreground">Hosted by</p>
            <p className="font-semibold text-foreground">{event.host_name || "Community Host"}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">About this event</h2>
          <p className="leading-relaxed text-muted-foreground">{event.description}</p>
        </div>

        {/* RSVP Button */}
        <RSVPButton 
          eventId={id!} 
          initialRsvped={rsvped} 
          onStatusChange={handleStatusChange} 
        />
      </div>
    </div>
  );
}
