import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Trash2, Edit3, CheckCircle2, Star, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  joined: string;
}

const DEFAULT_USER: UserData = {
  name: "Alex Rivera",
  email: "alex.rivera@email.com",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  joined: "January 2026",
};

function getStoredUser(): UserData | null {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || DEFAULT_USER.name,
        email: parsed.email || DEFAULT_USER.email,
        avatar: parsed.avatar || DEFAULT_USER.avatar,
        joined: parsed.joined || DEFAULT_USER.joined,
      };
    }
  } catch {
    // ignore parse errors
  }
  // If no stored user but a token exists, use defaults
  if (localStorage.getItem("token")) {
    return DEFAULT_USER;
  }
  // Fall back to mock user for demo purposes
  return DEFAULT_USER;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(getStoredUser);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const isLoggedIn = !!user;

  // RSVP summary — mocked values (ready for real integration)
  const rsvpSummary = { going: 5, interested: 3, notGoing: 1 };

  const stats = [
    { label: "Going", count: rsvpSummary.going, icon: CheckCircle2, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/15" },
    { label: "Interested", count: rsvpSummary.interested, icon: Star, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/15" },
    { label: "Declined", count: rsvpSummary.notGoing, icon: XCircle, color: "text-destructive", bg: "bg-destructive/15" },
  ];

  // ---------- Not Logged In ----------
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-foreground">Not logged in</h2>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
          You must be logged in to view your profile.
        </p>
        <Button
          onClick={() => navigate("/login")}
          className="mt-6 rounded-xl px-8 py-3"
        >
          Log in
        </Button>
      </div>
    );
  }

  // ---------- Edit Profile ----------
  const openEdit = () => {
    setEditName(user.name);
    setEditOpen(true);
  };

  const saveEdit = () => {
    const updated = { ...user, name: editName.trim() || user.name };
    setUser(updated);
    try {
      localStorage.setItem("user", JSON.stringify(updated));
    } catch {
      // storage full — ignore
    }
    setEditOpen(false);
    toast({ title: "Profile updated", description: "Your name has been updated." });
  };

  // ---------- Delete Account ----------
  const handleDelete = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast({ title: "Account deleted", description: "You have been logged out." });
    navigate("/");
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-background">
      {/* Header banner */}
      <div className="h-32 bg-gradient-to-br from-primary/20 via-background to-background" />

      <div className="container -mt-16 pb-12">
        {/* Avatar + Info */}
        <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-28 w-28 rounded-2xl border-4 border-background object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-background bg-secondary shadow-xl">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="mt-4 text-center sm:mt-0 sm:text-left">
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-4">
              <span className="flex items-center justify-center gap-1.5 sm:justify-start">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </span>
              <span className="flex items-center justify-center gap-1.5 sm:justify-start">
                <Calendar className="h-3.5 w-3.5" /> Joined {user.joined}
              </span>
            </div>
          </div>
        </div>

        {/* RSVP Summary */}
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.count}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Account Summary */}
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Account Summary</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You have RSVP'd to {rsvpSummary.going + rsvpSummary.interested + rsvpSummary.notGoing} events.
            Keep exploring to discover more happenings near you!
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="gap-2 rounded-xl" onClick={openEdit}>
            <Edit3 className="h-4 w-4" /> Edit Profile
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive">
                <Trash2 className="h-4 w-4" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your profile and RSVP history will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your display name below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
