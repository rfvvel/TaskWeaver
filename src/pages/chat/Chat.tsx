import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Send, Phone, Video, Smile, Paperclip, Hash, Lock,
  Users, PhoneOff, Mic, MicOff, VideoOff, UserPlus,
  Plus, Trash2, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "../../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  avatarSeed: string;
  joinDate: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  members: TeamMember[];
  bigTasks: unknown[];
}

interface Message {
  id: string;
  user: string;
  message: string;
  time: string;
  isOwn: boolean;
}

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  isDefault: boolean; // default channels cannot be deleted
}

// ─── Seed channels cloned per team on first open ──────────────────────────────

const SEED_CHANNELS: Channel[] = [
  { id: "c-general",       name: "general",       isPrivate: false, isDefault: true },
  // { id: "c-development",   name: "development",   isPrivate: false, isDefault: true },
  // { id: "c-design",        name: "design",        isPrivate: false, isDefault: true },
  // { id: "c-testing",       name: "testing",       isPrivate: false, isDefault: true },
  // { id: "c-project-leads", name: "project-leads", isPrivate: true,  isDefault: true },
];

const STATUS_CYCLE = ["online", "online", "away", "online", "offline"] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Chat() {
  const navigate = useNavigate();
  const { activeTeam, teams } = useOutletContext<{
    activeTeam: string;
    teams: Team[];
  }>();

  const activeTeamData = teams.find((t) => t.name === activeTeam);
  const members: TeamMember[] = activeTeamData?.members ?? [];

  // ── State ──────────────────────────────────────────────────────────────────

  // { [teamName]: Channel[] }
  const [teamChannels, setTeamChannels] = useState<Record<string, Channel[]>>({});

  // { [teamName]: { [channelId]: Message[] } }
  const [allMessages, setAllMessages] = useState<Record<string, Record<string, Message[]>>>({});

  // { [teamName]: channelId }
  const [activeChannelId, setActiveChannelId] = useState<Record<string, string>>({});

  const [callState, setCallState] = useState<"idle" | "voice" | "video">("idle");
  const [micMuted,  setMicMuted]  = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  const [message, setMessage] = useState("");

  // Create-channel dialog
  const [createOpen,  setCreateOpen]  = useState(false);
  const [channelName, setChannelName] = useState("");
  const [isPrivate,   setIsPrivate]   = useState(false);
  const [nameError,   setNameError]   = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const channels: Channel[] = teamChannels[activeTeam] ?? SEED_CHANNELS;

  const currentChannelId: string =
    activeChannelId[activeTeam] ?? channels[0]?.id ?? "";

  const selectedChannel: Channel =
    channels.find((c) => c.id === currentChannelId) ?? channels[0];

  const currentMessages: Message[] =
    allMessages[activeTeam]?.[currentChannelId] ?? [];

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Seed channels for teams that haven't been opened yet
    if (!teamChannels[activeTeam]) {
      setTeamChannels((prev) => ({ ...prev, [activeTeam]: SEED_CHANNELS }));
    }
    setCallState("idle");
    setCallTimer(0);
    setMicMuted(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeam]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  useEffect(() => {
    if (callState === "idle") { setCallTimer(0); return; }
    const id = setInterval(() => setCallTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [callState]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const statusColor = (idx: number) => {
    const s = STATUS_CYCLE[idx % STATUS_CYCLE.length];
    return s === "online" ? "bg-green-500" : s === "away" ? "bg-yellow-500" : "bg-gray-400";
  };

  const statusLabel = (idx: number) => STATUS_CYCLE[idx % STATUS_CYCLE.length];

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const slugify = (s: string) =>
    s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const selectChannel = (ch: Channel) =>
    setActiveChannelId((prev) => ({ ...prev, [activeTeam]: ch.id }));

  // ── Send message ───────────────────────────────────────────────────────────

  const handleSend = () => {
    if (!message.trim() || !selectedChannel) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      user: "You",
      message: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };
    setAllMessages((prev) => ({
      ...prev,
      [activeTeam]: {
        ...prev[activeTeam],
        [currentChannelId]: [...(prev[activeTeam]?.[currentChannelId] ?? []), newMsg],
      },
    }));
    setMessage("");
  };

  // ── Create channel ─────────────────────────────────────────────────────────

  const handleCreateChannel = () => {
    const slug = slugify(channelName);
    if (!slug) { setNameError("Channel name cannot be empty."); return; }
    if (channels.some((c) => c.name === slug)) {
      setNameError(`#${slug} already exists in this team.`);
      return;
    }
    const newCh: Channel = {
      id: `c-${Date.now()}`,
      name: slug,
      isPrivate,
      isDefault: false,
    };
    setTeamChannels((prev) => ({
      ...prev,
      [activeTeam]: [...(prev[activeTeam] ?? SEED_CHANNELS), newCh],
    }));
    setActiveChannelId((prev) => ({ ...prev, [activeTeam]: newCh.id }));
    setCreateOpen(false);
    setChannelName("");
    setIsPrivate(false);
    setNameError("");
  };

  // ── Delete channel ─────────────────────────────────────────────────────────

  const handleDeleteChannel = (ch: Channel) => {
    const updated = channels.filter((c) => c.id !== ch.id);
    setTeamChannels((prev) => ({ ...prev, [activeTeam]: updated }));
    if (ch.id === currentChannelId && updated.length > 0) {
      setActiveChannelId((prev) => ({ ...prev, [activeTeam]: updated[0].id }));
    }
  };


 if (teams.length === 0) {
    return (
      <div className="p-6 h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center">
              <Users className="w-12 h-12 text-indigo-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-amber-100 border-4 border-white flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">You haven't joined any team yet</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            The Chat feature is only available within a team context. Join or create a team first, then you can start discussing in channels with other members.
          </p>
          <Button
            onClick={() => navigate("/team-management")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white gap-2 w-full"
          >
            <UserPlus className="w-4 h-4" /> Create or Join a Team
          </Button>
          <p className="text-xs text-slate-400 mt-3">
            Once joined, Chat will be available right here.
          </p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="p-6">

      {/* ── Create Channel Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) { setChannelName(""); setIsPrivate(false); setNameError(""); }
      }}>
        <DialogContent className="rounded-2xl max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Create a New Channel</DialogTitle>
            <DialogDescription>
              Channels are where your team communicates. Keep them focused on a topic.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name input */}
            <div className="space-y-1.5">
              <Label htmlFor="ch-name">Channel Name</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm select-none">
                  #
                </span>
                <Input
                  id="ch-name"
                  placeholder="e.g. backend-api"
                  value={channelName}
                  onChange={(e) => { setChannelName(e.target.value); if (nameError) setNameError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateChannel()}
                  className={`rounded-xl pl-7 ${nameError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {nameError ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {nameError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Lowercase, numbers, and hyphens only. Spaces become hyphens automatically.
                </p>
              )}
            </div>

            {/* Privacy toggle card */}
            <div
              onClick={() => setIsPrivate((v) => !v)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                isPrivate
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isPrivate ? "bg-indigo-100" : "bg-white border border-slate-200"
              }`}>
                {isPrivate
                  ? <Lock className="w-4 h-4 text-indigo-600" />
                  : <Hash className="w-4 h-4 text-slate-500" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isPrivate ? "text-indigo-700" : "text-slate-700"}`}>
                  {isPrivate ? "Private Channel" : "Public Channel"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPrivate
                    ? "Only invited members can see and join this channel."
                    : "Everyone in the team can see and join this channel."}
                </p>
              </div>
              {/* Toggle pill */}
              <div className={`w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${isPrivate ? "bg-indigo-500" : "bg-slate-300"}`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform duration-200 shadow ${
                  isPrivate ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={!channelName.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white disabled:opacity-40"
            >
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Main Card ── */}
      <Card className="border-border shadow-sm h-[calc(100vh-8rem)]">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">

            {/* ── Left: Channels Sidebar ── */}
            <div className="w-60 border-r border-border flex flex-col shrink-0">
              {/* Team name */}
              <div className="p-4 border-b border-border">
                <h2 className="text-sm font-bold text-foreground truncate">{activeTeam}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{members.length} members</p>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {/* Section label + add button */}
                  <div className="flex items-center justify-between px-3 pt-2 pb-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Channels
                    </p>
                    <button
                      onClick={() => setCreateOpen(true)}
                      title="Create channel"
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Channel list */}
                  <div className="space-y-0.5">
                    {channels.map((ch) => {
                      const isActive = ch.id === currentChannelId;
                      return (
                        <div key={ch.id} className="group/ch flex items-center gap-1 pr-1">
                          {/* Channel button */}
                          <button
                            onClick={() => selectChannel(ch)}
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors min-w-0 ${
                              isActive
                                ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white"
                                : "text-foreground hover:bg-accent"
                            }`}
                          >
                            {ch.isPrivate
                              ? <Lock className="w-3.5 h-3.5 shrink-0" />
                              : <Hash className="w-3.5 h-3.5 shrink-0" />
                            }
                            <span className="flex-1 text-left truncate">{ch.name}</span>
                          </button>

                          {/* Delete (custom channels only) */}
                          {!ch.isDefault && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  title="Delete channel"
                                  className={`w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover/ch:opacity-100 transition-opacity shrink-0 ${
                                    isActive
                                      ? "text-white/70 hover:text-white hover:bg-white/20"
                                      : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete #{ch.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    All messages in <strong>#{ch.name}</strong> will be permanently
                                    deleted. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteChannel(ch)}
                                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* "Add a channel" shortcut at bottom */}
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>Add a channel</span>
                  </button>
                </div>
              </ScrollArea>
            </div>

            {/* ── Center: Chat Area ── */}
            <div className="flex-1 flex flex-col min-w-0">

              {/* Header */}
              <div className="h-16 border-b border-border px-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedChannel?.isPrivate
                    ? <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                  }
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {selectedChannel?.name ?? "—"}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {members.length} members
                      {selectedChannel?.isPrivate && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant={callState === "voice" ? "default" : "outline"}
                    size="icon"
                    className={`rounded-xl ${callState === "voice" ? "bg-green-500 hover:bg-green-600 text-white border-0" : ""}`}
                    onClick={() => setCallState(callState === "voice" ? "idle" : "voice")}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={callState === "video" ? "default" : "outline"}
                    size="icon"
                    className={`rounded-xl ${callState === "video" ? "bg-indigo-500 hover:bg-indigo-600 text-white border-0" : ""}`}
                    onClick={() => setCallState(callState === "video" ? "idle" : "video")}
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </div> */}
              </div>

              {/* Call Banner */}
              {callState !== "idle" && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-5 py-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                        {callState === "video"
                          ? <Video className="w-4 h-4 text-white" />
                          : <Phone className="w-4 h-4 text-white" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          {callState === "video" ? "Video" : "Voice"} call in progress
                        </p>
                        <p className="text-xs text-green-700">
                          {members.length} participants · {fmt(callTimer)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline" size="icon"
                        className="rounded-xl border-green-300 hover:bg-green-100"
                        onClick={() => setMicMuted((m) => !m)}
                      >
                        {micMuted
                          ? <MicOff className="w-4 h-4 text-red-500" />
                          : <Mic className="w-4 h-4 text-green-700" />
                        }
                      </Button>
                      {callState === "video" && (
                        <Button
                          variant="outline" size="icon"
                          className="rounded-xl border-green-300 hover:bg-green-100"
                          onClick={() => setCallState("voice")}
                        >
                          <VideoOff className="w-4 h-4 text-green-700" />
                        </Button>
                      )}
                      <Button
                        variant="destructive" size="sm"
                        onClick={() => { setCallState("idle"); setMicMuted(false); }}
                        className="rounded-xl gap-1"
                      >
                        <PhoneOff className="w-3.5 h-3.5" /> End
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
                {currentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                      {selectedChannel?.isPrivate
                        ? <Lock className="w-6 h-6 text-indigo-400" />
                        : <Hash className="w-6 h-6 text-indigo-400" />
                      }
                    </div>
                    <h3 className="font-semibold text-slate-700 text-lg">
                      Welcome to #{selectedChannel?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      This is the very beginning of <strong>{activeTeam}</strong> ·{" "}
                      #{selectedChannel?.name}. Send the first message!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="w-9 h-9 flex-shrink-0">
                          <AvatarFallback className="text-xs font-semibold bg-indigo-100 text-indigo-700">
                            {initials(msg.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 max-w-[70%] ${msg.isOwn ? "flex flex-col items-end" : ""}`}>
                          <div className={`flex items-baseline gap-2 mb-1 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                            <span className="font-medium text-sm text-foreground">{msg.user}</span>
                            <span className="text-xs text-muted-foreground">{msg.time}</span>
                          </div>
                          <div className={`inline-block px-4 py-2 rounded-xl text-sm ${
                            msg.isOwn
                              ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-tr-sm"
                              : "bg-accent text-foreground rounded-tl-sm"
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border shrink-0">
                <div className="flex items-center gap-2">
                  {/* <Button variant="ghost" size="icon" className="rounded-xl shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </Button> */}
                  <div className="flex-1 relative">
                    <Input
                      placeholder={`Message #${selectedChannel?.name ?? "…"}`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      className="rounded-xl pr-10"
                    />
                    {/* <Button
                      variant="ghost" size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg"
                    >
                      <Smile className="w-4 h-4" />
                    </Button> */}
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl shrink-0 disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Right: Members Panel ── */}
            <div className="w-56 border-l border-border flex flex-col shrink-0">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground text-sm">Members</h3>
                  <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
                    {members.length}
                  </Badge>
                </div>
              </div>

              <ScrollArea className="flex-1 p-2">
                {members.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">
                    No members in this team
                  </p>
                ) : (
                  <div className="space-y-1">
                    {(["online", "away", "offline"] as const).map((group) => {
                      const grouped = members.filter((_, i) => statusLabel(i) === group);
                      if (!grouped.length) return null;
                      return (
                        <div key={group}>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-3 pb-1">
                            {group === "online"
                              ? `Online — ${grouped.length}`
                              : group === "away"
                              ? `Away — ${grouped.length}`
                              : `Offline — ${grouped.length}`}
                          </p>
                          {grouped.map((member) => {
                            const idx = members.indexOf(member);
                            return (
                              <div
                                key={member.id}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                              >
                                <div className="relative shrink-0">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-700">
                                      {initials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${statusColor(idx)} rounded-full border-2 border-card`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                                  <p className="text-[10px] text-muted-foreground capitalize truncate">{member.role}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
