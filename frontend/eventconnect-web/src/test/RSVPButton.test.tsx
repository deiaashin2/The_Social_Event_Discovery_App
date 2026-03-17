import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import RSVPButton from "../components/RSVPButton";

// Mock global fetch
global.fetch = vi.fn();

describe("RSVPButton Component", () => {
  const mockEventId = "123";
  const mockUser = { id: 1, name: "Test User" };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify(mockUser));
  });

  it("renders correctly with initial 'not going' state", () => {
    render(
      <MemoryRouter>
        <RSVPButton eventId={mockEventId} initialRsvped={false} />
      </MemoryRouter>
    );

    expect(screen.getByText(/RSVP — I'm in!/i)).toBeInTheDocument();
  });

  it("disables button and shows loading state when clicked", async () => {
    // Mock a slow response
    (fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ attendee_count: 10 })
      }), 100))
    );

    render(
      <MemoryRouter>
        <RSVPButton eventId={mockEventId} initialRsvped={false} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText(/processing.../i)).toBeInTheDocument();
  });

  it("updates text to 'Going' upon successful RSVP", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ attendee_count: 11 }),
    });

    render(
      <MemoryRouter>
        <RSVPButton eventId={mockEventId} initialRsvped={false} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/you're going!/i)).toBeInTheDocument();
    });
    
    expect(fetch).toHaveBeenCalledWith(`/rsvp/${mockEventId}`, expect.any(Object));
  });

  it("updates text back to 'RSVP' when cancelling", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ attendee_count: 10 }),
    });

    render(
      <MemoryRouter>
        <RSVPButton eventId={mockEventId} initialRsvped={true} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button");
    expect(screen.getByText(/you're going!/i)).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/RSVP — I'm in!/i)).toBeInTheDocument();
    });
  });
});
