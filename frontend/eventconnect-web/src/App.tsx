import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"; // Added useState and useEffect
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import EventDetails from "./pages/EventDetails";
import Attendees from "./pages/Attendees";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { get } from "./api"; // Import the get function

const queryClient = new QueryClient();

function Layout() {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);
  const [apiStatus, setApiStatus] = useState("Loading API status..."); // Added state for API status

  useEffect(() => {
    // Effect to fetch API status
    async function fetchApiStatus() {
      try {
        const data = await get("/api/status");
        setApiStatus(data.message);
      } catch (error) {
        setApiStatus(`API Error: ${error.message}`);
      }
    }
    fetchApiStatus();
  }, []);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <p>API Status: {apiStatus}</p> {/* Display API status */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events/:id/attendees" element={<Attendees />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
