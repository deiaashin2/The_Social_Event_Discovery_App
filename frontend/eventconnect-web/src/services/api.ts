import { mockEvents, mockConversations, mockMessages, type Event, type ChatConversation, type ChatMessage } from "@/data/mockEvents";

const API_BASE = "/api"; // placeholder for future backend

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  // TODO: Replace with actual API call
  return { status: "ok" };
}

// Events
export async function getEvents(): Promise<Event[]> {
  return mockEvents;
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return mockEvents.find((e) => e.id === id);
}

export async function getEventsByCategory(category: string): Promise<Event[]> {
  if (category === "All") return mockEvents;
  return mockEvents.filter((e) => e.category === category);
}

export async function searchEvents(query: string): Promise<Event[]> {
  const q = query.toLowerCase();
  return mockEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
  );
}

export async function rsvpToEvent(eventId: string): Promise<{ success: boolean }> {
  // TODO: Replace with actual API call
  return { success: true };
}

// Chat
export async function getConversations(): Promise<ChatConversation[]> {
  return mockConversations;
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  return mockMessages[conversationId] || [];
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  const msg: ChatMessage = {
    id: `m-${Date.now()}`,
    senderId: "me",
    text,
    timestamp: "Just now",
    isOwn: true,
  };
  return msg;
}

// Auth (placeholder)
export async function login(email: string, password: string): Promise<{ success: boolean; token?: string }> {
  // TODO: Replace with actual API call
  return { success: true, token: "mock-token" };
}

export async function signup(name: string, email: string, password: string): Promise<{ success: boolean }> {
  // TODO: Replace with actual API call
  return { success: true };
}
