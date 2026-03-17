import { useState, useEffect } from "react"; //Update: Added useEffect for socket connection
import { mockConversations, mockMessages, type ChatMessage } from "@/data/mockEvents";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { getSocket, sendMessageWithRetry } from "@/services/socket"; // Import socket functions

export default function Chat() {
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(mockMessages);
  const [input, setInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

useEffect(() => {
  const socket = getSocket();

  // Immediately check if already connected
  if (socket.connected) {
    setConnectionStatus("Connected");
  }

  socket.on("connect", () => {
    setConnectionStatus("Connected");
  });

  socket.on("disconnect", () => {
    setConnectionStatus("Disconnected");
  });

  socket.on("chat_message", (data) => {
    if (!activeConvo) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: "other",
      text: data.message,
      timestamp: "Just now",
      isOwn: false,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConvo]: [...(prev[activeConvo] || []), newMsg],
    }));
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("chat_message");
  };
}, []);

  const activeConversation = mockConversations.find((c) => c.id === activeConvo);

  const handleSend = () => {
    if (!input.trim() || !activeConvo) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: "me",
      text: input,
      timestamp: "Just now",
      isOwn: true,
    };
    setMessages((prev) => ({
      ...prev,
      [activeConvo]: [...(prev[activeConvo] || []), newMsg],
    }));
    
    sendMessageWithRetry({
      roomId: activeConvo,
      message: input,
});
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Sidebar */}
      <div className={`w-full border-r border-border md:w-80 ${activeConvo ? "hidden md:block" : "block"}`}>
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        </div>
        <div className="overflow-y-auto">
          {mockConversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConvo(c.id)}
              className={`flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors ${
                activeConvo === c.id ? "bg-primary/10" : "hover:bg-secondary"
              }`}
            >
              <img src={c.avatar} alt={c.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{c.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`flex flex-1 flex-col ${activeConvo ? "block" : "hidden md:flex"}`}>
        {activeConvo && activeConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button onClick={() => setActiveConvo(null)} className="text-muted-foreground hover:text-foreground md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <img src={activeConversation.avatar} alt={activeConversation.name} className="h-9 w-9 rounded-full object-cover" />
              <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {activeConversation.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Status: {connectionStatus}
              </span>
            </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(messages[activeConvo] || []).map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card text-foreground rounded-bl-md"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`mt-1 text-xs ${msg.isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="mb-3 h-12 w-12 opacity-30" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
