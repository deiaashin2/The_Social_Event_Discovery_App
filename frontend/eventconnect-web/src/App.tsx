<<<<<<< HEAD
import { useParams, Link, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { MapPin, Clock, Users, ArrowLeft, Share2, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [rsvped, setRsvped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendeeCount, setAttendeeCount] = useState(0);

useEffect(() => {
  const socket = io("http://localhost:4000", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Connected to socket:", socket.id);
  });

  socket.on("notification", (data) => {
    console.log("NOTIFICATION RECEIVED:", data);

    // Fix: Use setTimeout to ensure alert runs after current execution context
    setTimeout(() => {
      alert(`${data.title}: ${data.body}`);
    }, 100);
  });

  return () => {
    socket.disconnect();
  };
}, []);
useEffect(() => {
    async function fetchEventAndStatus() {
      try {
        if (!id) return;
        const res = await fetch(`http://localhost:4000/events/${id}`);
        if (!res.ok) throw new Error("Event not found");
        const eventData = await res.json();
        setEvent(eventData);
        setAttendeeCount(eventData.rsvp_count || 0);

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

  const handleRSVP = async () => {
    console.log("Sending RSVP request...");
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      alert("Please log in first");
      return;
    }

    const user = JSON.parse(userData);

    try {
      const res = await fetch(`http://localhost:4000/rsvp/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          status: rsvped ? "not_going" : "going",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRsvped(!rsvped);
        setAttendeeCount(data.attendee_count);
      }
    } catch (err) {
      console.error("RSVP failed:", err);
    }
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

  const eventImage =
    event.image ||
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop";
  const eventDate = new Date(event.start_time).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const eventTime = new Date(event.start_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
=======
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" replace />;
}
>>>>>>> 7fca2704d8192ec118cb04ca80862f047047dd32

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


      <div className="container relative z-10 -mt-16 pb-12">
        <span className="mb-3 inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
          {event.category || "General"}
        </span>
        <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          {event.title}
        </h1>

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

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
            alt="Host"
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="text-xs text-muted-foreground">Hosted by</p>
            <p className="font-semibold text-foreground">
              {event.host_name || "Community Host"}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            About this event
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRSVP}
          className={`w-full rounded-xl py-4 text-base font-semibold transition-all ${
            rsvped
              ? "border border-success/30 bg-success/20 text-success"
              : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          }`}
        >
          {rsvped ? "✓ You're going!" : "RSVP — I'm in!"}
        </button>
      </div>
    </div>

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>

  );
}

export default function App() {
  return (
    <Routes>
      {/* Redirect root to a valid event */}
      <Route path="/" element={<Navigate to="/event/1" />} />

      {/* Event page with ID */}
     <Route path="/event/:id" element={<EventDetails />} />

      {/* Fallback */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}
