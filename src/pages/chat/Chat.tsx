import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Send, Hash, Users, UserPlus, Plus, Trash2, AlertCircle,
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
  isDefault: boolean;
}

// Tidak ada channel default otomatis (kosong saat awal grup dibuat)
const SEED_CHANNELS: Channel[] = [];

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

  const [teamChannels, setTeamChannels] = useState<Record<string, Channel[]>>({});
  const [allMessages, setAllMessages] = useState<Record<string, Record<string, Message[]>>>({});
  const [activeChannelId, setActiveChannelId] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const [createOpen,  setCreateOpen]  = useState(false);
  const [channelName, setChannelName] = useState("");
  const [nameError,   setNameError]   = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const channels: Channel[] = teamChannels[activeTeam] ?? SEED_CHANNELS;
  const currentChannelId: string = activeChannelId[activeTeam] ?? channels[0]?.id ?? "";
  const selectedChannel: Channel = channels.find((c) => c.id === currentChannelId) ?? channels[0];
  const currentMessages: Message[] = allMessages[activeTeam]?.[currentChannelId] ?? [];

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!teamChannels[activeTeam]) {
      setTeamChannels((prev) => ({ ...prev, [activeTeam]: SEED_CHANNELS }));
    }
  }, [activeTeam]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const statusColor = (idx: number) => {
    const s = STATUS_CYCLE[idx % STATUS_CYCLE.length];
    return s === "online" ? "bg-green-500" : s === "away" ? "bg-yellow-500" : "bg-gray-400";
  };

  const statusLabel = (idx: number) => STATUS_CYCLE[idx % STATUS_CYCLE.length];

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const slugify = (s: string) =>
    s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const setActiveChannelIdWrapper = (ch: Channel) =>
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
      isPrivate: false,
      isDefault: false,
    };
    setTeamChannels((prev) => ({
      ...prev,
      [activeTeam]: [...(prev[activeTeam] ?? []), newCh],
    }));
    setActiveChannelId((prev) => ({ ...prev, [activeTeam]: newCh.id }));
    setCreateOpen(false);
    setChannelName("");
    setNameError("");
  };

  // ── Delete channel ─────────────────────────────────────────────────────────

  const handleDeleteChannel = (ch: Channel) => {
    const updated = channels.filter((c) => c.id !== ch.id);
    setTeamChannels((prev) => ({ ...prev, [activeTeam]: updated }));
    if (ch.id === currentChannelId && updated.length > 0) {
      setActiveChannelId((prev) => ({ ...prev, [activeTeam]: updated[0].id }));
    } else if (updated.length === 0) {
      setActiveChannelId((prev) => ({ ...prev, [activeTeam]: "" }));
    }
  };

  if (teams.length === 0) {
    return (
      <div className="p-6 h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
              <Users className="w-12 h-12 text-indigo-300 dark:text-indigo-700" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You haven't joined any team yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Join or create a team first, then you can start discussing in channels.
          </p>
          <Button
            onClick={() => navigate("/team-management")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Create or Join a Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">

      {/* ── Create Channel Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) { setChannelName(""); setNameError(""); }
      }}>
        <DialogContent className="rounded-2xl max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Create a New Channel</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Channels are where your team communicates. Keep them focused on a topic.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ch-name">Channel Name</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm select-none">
                  #
                </span>
                <Input
                  id="ch-name"
                  placeholder="e.g. backend-api"
                  value={channelName}
                  onChange={(e) => { setChannelName(e.target.value); if (nameError) setNameError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateChannel()}
                  className={`rounded-xl pl-7 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 ${nameError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {nameError ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {nameError}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Lowercase, numbers, and hyphens only.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={!channelName.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white disabled:opacity-40"
            >
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Main Card ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        <CardContent className="p-0 h-full">
          {/* PERBAIKAN: Memperbaiki typo h-fullw menjadi h-full agar grid sejajar horizontal */}
          <div className="flex h-full">

            {/* ── Left: Channels Sidebar ── */}
            <div className="w-60 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-white dark:bg-slate-900">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-bold truncate">{activeTeam}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{members.length} members</p>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 pt-2 pb-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Channels
                    </p>
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {channels.map((ch) => {
                      const isActive = ch.id === currentChannelId;
                      return (
                        <div key={ch.id} className="group/ch flex items-center gap-1 pr-1">
                          <button
                            onClick={() => setActiveChannelIdWrapper(ch)}
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors min-w-0 ${
                              isActive
                                ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <Hash className="w-3.5 h-3.5 shrink-0" />
                            <span className="flex-1 text-left truncate">{ch.name}</span>
                          </button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className={`w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover/ch:opacity-100 transition-opacity shrink-0 ${
                                  isActive
                                    ? "text-white/70 hover:text-white hover:bg-white/20"
                                    : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete #{ch.name}?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  All messages will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-800">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteChannel(ch)}
                                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* ── Center: Chat Area ── */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/20 border-r border-slate-200 dark:border-slate-800">
              {selectedChannel ? (
                <>
                  <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-5 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{selectedChannel.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
                    {currentMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <h3 className="font-semibold text-lg">Welcome to #{selectedChannel.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">Send the first message!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentMessages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                            <Avatar className="w-9 h-9 flex-shrink-0">
                              <AvatarFallback className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                {initials(msg.user)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex-1 max-w-[70%] ${msg.isOwn ? "flex flex-col items-end" : ""}`}>
                              <span className="text-xs text-slate-400 mb-1">{msg.user}</span>
                              <div className={`inline-block px-4 py-2 rounded-xl text-sm ${
                                msg.isOwn ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                              }`}>
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={`Message #${selectedChannel.name}`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                      <Button onClick={handleSend} disabled={!message.trim()} className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Hash className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <h3 className="font-semibold text-lg">No channels available</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-4">Click the plus icon on the sidebar to create your first channel.</p>
                  <Button onClick={() => setCreateOpen(true)} className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white gap-1">
                    <Plus className="w-4 h-4" /> Create Channel
                  </Button>
                </div>
              )}
            </div>

            {/* ── Right Sidebar: Members Panel ── */}
            <div className="w-60 flex flex-col shrink-0 bg-white dark:bg-slate-900">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <h3 className="font-semibold text-sm">Members</h3>
                  <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {members.length}
                  </Badge>
                </div>
              </div>

              <ScrollArea className="flex-1 p-2">
                {members.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">
                    No members in this team
                  </p>
                ) : (
                  <div className="space-y-1">
                    {(["online", "away", "offline"] as const).map((group) => {
                      const grouped = members.filter((_, i) => statusLabel(i) === group);
                      if (!grouped.length) return null;
                      return (
                        <div key={group}>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">
                            {group} — {grouped.length}
                          </p>
                          {grouped.map((member) => {
                            const idx = members.indexOf(member);
                            return (
                              <div
                                key={member.id}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <div className="relative shrink-0">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                      {initials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${statusColor(idx)} rounded-full border-2 border-white dark:border-slate-900`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{member.name}</p>
                                  <p className="text-[10px] text-slate-400 capitalize truncate">{member.role}</p>
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