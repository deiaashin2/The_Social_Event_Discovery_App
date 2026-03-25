import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, Users, ArrowLeft, Share2, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [rsvped, setRsvped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpFeedback, setRsvpFeedback] = useState<any>(null);

  useEffect(() => {
  const handler = (data: any) => {
    console.log("NOTIFICATION RECEIVED:", data);
    alert(`${data.title}: ${data.body}`);
  };

  socket.on("notification", handler);

  return () => {
    socket.off("notification", handler);
  };
}, []);

  useEffect(() => {
    async function fetchEventAndStatus() {
      try {

      // Ticketmaster event
      const useTicketmaster = false;

      const url = useTicketmaster
      ? `http://localhost:4000/ticketmaster-events/${id}`
      : `http://localhost:4000/events/${id}`;

      const eventRes = await fetch(url);

        if (!eventRes.ok) throw new Error("Event not found");

        const eventData = await eventRes.json();
        setEvent(eventData);

        setAttendeeCount(0);

        // RSVP status from backend
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          const user = JSON.parse(userData);

          const statusRes = await fetch(
            `http://localhost:4000/rsvp/${id}/status/${user.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setRsvped(statusData.status === "going");
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

  // RSVP Handler
  const handleRSVP = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userData);
    const nextStatus = rsvped ? "not_going" : "going";

    try {
      setIsSubmittingRsvp(true);
      setRsvpFeedback(null);

      const res = await fetch(`http://localhost:4000/rsvp/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      user_id: 1,   
      status: nextStatus,
    }),
  });

      if (!res.ok) throw new Error("Failed to update RSVP");

      const data = await res.json();

      setRsvped(nextStatus === "going");
      setAttendeeCount(data.attendee_count);

      setRsvpFeedback({
        type: "success",
        message: "RSVP updated successfully",
      });
    } catch (err) {
      console.error("RSVP failed:", err);
      setRsvpFeedback({
        type: "error",
        message: "Failed to update RSVP",
      });
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!event) {
    return <div className="text-center mt-10">Event not found</div>;
  }

  // Ticketmaster field mapping
const eventTitle = event.name || event.title;

const eventDescription =
  event.info || event.description || "No description available";

const eventLocation =
  event._embedded?.venues?.[0]?.name ||
  event.location_name ||
  "Unknown location";

const eventDate =
  event.dates?.start?.localDate ||
  new Date(event.start_time).toLocaleDateString();

const eventTime =
  event.dates?.start?.localTime ||
  new Date(event.start_time).toLocaleTimeString();

  return (
<div className="min-h-screen bg-background">
  <div className="relative h-64 md:h-96">
    <img
      src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop"
      alt={eventTitle}
      className="h-full w-full object-cover"
    />
  </div>

  <div className="container relative z-10 -mt-16 pb-12">
    <span className="mb-3 inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
      General
    </span>

    <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
      {eventTitle}
    </h1>

    <div className="mb-6 flex flex-wrap gap-4">
      <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm">
        <Clock className="h-4 w-4 text-primary" />
        {eventDate} · {eventTime}
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm">
        <MapPin className="h-4 w-4 text-primary" />
        {eventLocation}
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm">
        <Users className="h-4 w-4 text-primary" />
        {attendeeCount}
      </div>
    </div>

    <div className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">About this event</h2>
      <p>{eventDescription}</p>
    </div>

    {rsvpFeedback && (
      <div className="mb-4">{rsvpFeedback.message}</div>
    )}

    <button
      onClick={handleRSVP}
      className="w-full rounded-xl py-4 bg-primary text-white"
    >
      {rsvped ? "✓ You're going!" : "RSVP — I'm in!"}
    </button>
  </div>
</div>
  );
}