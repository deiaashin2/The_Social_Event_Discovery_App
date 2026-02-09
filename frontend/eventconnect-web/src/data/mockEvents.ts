export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  host: {
    name: string;
    avatar: string;
  };
  attendees: Attendee[];
  rsvpCount: number;
  capacity: number;
}

export interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

export interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
];

const generateAttendees = (count: number): Attendee[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `att-${i}`,
    name: ["Sofia Chen", "Marcus Johnson", "Aisha Patel", "Liam O'Brien", "Yuki Tanaka", "Zara Williams"][i % 6],
    avatar: avatars[i % avatars.length],
  }));

export const categories = [
  "All",
  "Music",
  "Tech",
  "Food & Drink",
  "Arts",
  "Sports",
  "Networking",
  "Nightlife",
  "Wellness",
];

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Neon Nights: Electronic Music Festival",
    description: "Immerse yourself in a night of cutting-edge electronic music featuring top DJs from around the world. State-of-the-art sound systems, mesmerizing light shows, and an unforgettable atmosphere await. Dance under the stars at this premier outdoor music experience.",
    date: "2026-03-15",
    time: "8:00 PM",
    location: "Warehouse District, Downtown",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop",
    category: "Music",
    host: { name: "EventFlow Productions", avatar: avatars[0] },
    attendees: generateAttendees(24),
    rsvpCount: 342,
    capacity: 500,
  },
  {
    id: "2",
    title: "AI & the Future: Tech Summit 2026",
    description: "Join industry leaders and innovators for a deep dive into artificial intelligence, machine learning, and the technologies shaping tomorrow. Featuring keynote talks, live demos, hands-on workshops, and unparalleled networking opportunities.",
    date: "2026-03-22",
    time: "9:00 AM",
    location: "Innovation Hub, Tech Park",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
    category: "Tech",
    host: { name: "TechForward", avatar: avatars[1] },
    attendees: generateAttendees(18),
    rsvpCount: 189,
    capacity: 300,
  },
  {
    id: "3",
    title: "Street Food Night Market",
    description: "Explore flavors from around the globe at our curated street food market. Over 30 vendors, live cooking demos, craft cocktails, and live acoustic sets create the perfect evening out.",
    date: "2026-03-28",
    time: "6:00 PM",
    location: "Central Plaza, Riverside",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop",
    category: "Food & Drink",
    host: { name: "Urban Eats Collective", avatar: avatars[2] },
    attendees: generateAttendees(30),
    rsvpCount: 456,
    capacity: 600,
  },
  {
    id: "4",
    title: "Contemporary Art Exhibition Opening",
    description: "Be among the first to experience a groundbreaking exhibition featuring emerging artists pushing the boundaries of contemporary art. Wine reception, artist talks, and immersive installations.",
    date: "2026-04-05",
    time: "7:00 PM",
    location: "Modern Art Gallery, Arts District",
    image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=500&fit=crop",
    category: "Arts",
    host: { name: "Gallery Nine", avatar: avatars[3] },
    attendees: generateAttendees(12),
    rsvpCount: 98,
    capacity: 150,
  },
  {
    id: "5",
    title: "Sunset Rooftop Yoga & Meditation",
    description: "Find your zen at this rooftop wellness experience. Guided yoga flow, meditation session, and healthy refreshments with a panoramic city sunset backdrop.",
    date: "2026-04-10",
    time: "5:30 PM",
    location: "Sky Terrace, The Grand Hotel",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop",
    category: "Wellness",
    host: { name: "Mindful Movement", avatar: avatars[4] },
    attendees: generateAttendees(15),
    rsvpCount: 67,
    capacity: 80,
  },
  {
    id: "6",
    title: "Startup Founders Mixer",
    description: "Connect with fellow entrepreneurs, investors, and mentors at this exclusive networking event. Lightning pitches, panel discussion on scaling startups, and open bar.",
    date: "2026-04-14",
    time: "7:00 PM",
    location: "The Loft, Innovation Center",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop",
    category: "Networking",
    host: { name: "StartupHub", avatar: avatars[5] },
    attendees: generateAttendees(20),
    rsvpCount: 124,
    capacity: 200,
  },
  {
    id: "7",
    title: "Championship Basketball Finals",
    description: "Witness the most anticipated game of the season as two rival teams battle for the championship title. High energy, incredible athleticism, and a packed arena.",
    date: "2026-04-18",
    time: "7:30 PM",
    location: "Metro Arena, Sports Complex",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=500&fit=crop",
    category: "Sports",
    host: { name: "Metro Sports League", avatar: avatars[0] },
    attendees: generateAttendees(30),
    rsvpCount: 890,
    capacity: 1200,
  },
  {
    id: "8",
    title: "Underground Jazz & Cocktails",
    description: "An intimate evening of world-class jazz in a secret speakeasy-style venue. Craft cocktails, candlelit ambiance, and the smoothest sounds in the city.",
    date: "2026-04-22",
    time: "9:00 PM",
    location: "The Velvet Room, Old Town",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=500&fit=crop",
    category: "Nightlife",
    host: { name: "Velvet Sessions", avatar: avatars[1] },
    attendees: generateAttendees(10),
    rsvpCount: 45,
    capacity: 60,
  },
];

export const mockConversations: ChatConversation[] = [
  { id: "c1", name: "Neon Nights Group", avatar: avatars[0], lastMessage: "Can't wait for tonight! 🎶", timestamp: "2m ago", unread: 3 },
  { id: "c2", name: "Tech Summit Crew", avatar: avatars[1], lastMessage: "Anyone heading to the AI workshop?", timestamp: "15m ago", unread: 0 },
  { id: "c3", name: "Sofia Chen", avatar: avatars[2], lastMessage: "See you at the food market!", timestamp: "1h ago", unread: 1 },
  { id: "c4", name: "Art Gallery Friends", avatar: avatars[3], lastMessage: "The exhibition was amazing", timestamp: "3h ago", unread: 0 },
  { id: "c5", name: "Yoga Squad", avatar: avatars[4], lastMessage: "Namaste 🧘‍♀️", timestamp: "5h ago", unread: 0 },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  c1: [
    { id: "m1", senderId: "other", text: "Hey everyone! Who's coming to Neon Nights?", timestamp: "10:30 AM", isOwn: false },
    { id: "m2", senderId: "me", text: "I'll be there! Got my tickets last week 🎉", timestamp: "10:32 AM", isOwn: true },
    { id: "m3", senderId: "other", text: "Amazing! Let's meet at the entrance around 7:30?", timestamp: "10:33 AM", isOwn: false },
    { id: "m4", senderId: "me", text: "Sounds perfect. Should I bring anything?", timestamp: "10:35 AM", isOwn: true },
    { id: "m5", senderId: "other", text: "Just good vibes! 😄", timestamp: "10:36 AM", isOwn: false },
    { id: "m6", senderId: "other", text: "Can't wait for tonight! 🎶", timestamp: "10:40 AM", isOwn: false },
  ],
  c2: [
    { id: "m7", senderId: "other", text: "The keynote schedule just dropped!", timestamp: "9:00 AM", isOwn: false },
    { id: "m8", senderId: "me", text: "Just saw it. The AI panel looks incredible", timestamp: "9:05 AM", isOwn: true },
    { id: "m9", senderId: "other", text: "Anyone heading to the AI workshop?", timestamp: "9:10 AM", isOwn: false },
  ],
  c3: [
    { id: "m10", senderId: "other", text: "Have you tried the new ramen place?", timestamp: "Yesterday", isOwn: false },
    { id: "m11", senderId: "me", text: "Not yet! Is it at the market?", timestamp: "Yesterday", isOwn: true },
    { id: "m12", senderId: "other", text: "See you at the food market!", timestamp: "1h ago", isOwn: false },
  ],
};
