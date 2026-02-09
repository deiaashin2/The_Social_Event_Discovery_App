# EventConnect

**EventConnect** is a social event discovery platform that helps users find, RSVP to, and connect over local events — from music festivals to tech meetups and food markets. Built as a senior capstone project, this MVP demonstrates a production-ready frontend architecture with a clean separation of concerns for future backend integration.

---

## Project Overview

EventConnect enables users to browse a curated feed of events, filter by category, view event details, see who's attending, and communicate with other attendees through an in-app chat interface. The platform features a modern dark UI with an Airbnb-inspired design language.

### Key Features

- **Event Discovery Feed** — Browse events with search and category filtering
- **Event Details** — View full event info, host profile, attendee list, and RSVP
- **Attendee Directory** — See who's going to each event
- **Chat Interface** — Conversation list and messaging UI (mock data)
- **Authentication Pages** — Login and signup forms (UI only)

---

## Sprint 1 Scope

### Implemented (Frontend)

| Feature | Status |
|---|---|
| Home feed with event cards, search, and category chips | ✅ Functional |
| Event details page with RSVP toggle | ✅ Functional |
| Attendees list page | ✅ Functional |
| Chat UI with conversations and messaging | ✅ Functional (local state) |
| Login / Signup forms | ✅ UI complete |
| Responsive layout (desktop + mobile) | ✅ Complete |
| API service layer with placeholder functions | ✅ Scaffolded |

### Mocked / Planned for Sprint 2

| Feature | Status |
|---|---|
| Backend API integration | 🔲 Placeholder functions in `src/services/api.ts` |
| User authentication | 🔲 Forms exist; no auth provider connected |
| Persistent chat (WebSocket / polling) | 🔲 UI complete; uses local state |
| Event creation | 🔲 Not started |
| User profiles | 🔲 Not started |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + custom design tokens |
| UI Components | shadcn/ui (selectively used) |
| Routing | React Router v6 |
| State / Data | TanStack React Query (configured), local state |
| Icons | Lucide React |

---

## How to Run Locally

**Prerequisites:** Node.js ≥ 18 and npm (or Bun)

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd eventconnect

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Folder Structure

```
src/
├── components/     # Reusable UI components (Navbar, EventCard, etc.)
├── data/           # Mock datasets
├── pages/          # Route-level page components
├── services/       # API service layer (placeholder for backend)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── index.css       # Design system tokens (HSL color palette)
```
