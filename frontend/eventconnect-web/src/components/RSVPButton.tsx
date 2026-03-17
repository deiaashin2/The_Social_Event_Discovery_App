import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RSVPButtonProps {
  eventId: string | number;
  initialRsvped: boolean;
  onStatusChange?: (newStatus: boolean, newCount: number) => void;
}

const RSVPButton: React.FC<RSVPButtonProps> = ({ eventId, initialRsvped, onStatusChange }) => {
  const [rsvped, setRsvped] = useState(initialRsvped);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRSVP = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userData);
    setLoading(true);

    try {
      const res = await fetch(`/rsvp/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          status: rsvped ? "not_going" : "going"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newRsvped = !rsvped;
        setRsvped(newRsvped);
        if (onStatusChange) {
          onStatusChange(newRsvped, data.attendee_count);
        }
      }
    } catch (err) {
      console.error("RSVP failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRSVP}
      disabled={loading}
      className={`w-full rounded-xl py-4 text-base font-semibold transition-all ${
        rsvped
          ? "bg-success/20 text-success border border-success/30"
          : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "Processing..." : rsvped ? "✓ You're going!" : "RSVP — I'm in!"}
    </button>
  );
};

export default RSVPButton;
