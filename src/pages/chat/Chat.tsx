import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Send, Hash, Users, UserPlus, Plus, Trash2, AlertCircle, Pencil, Check, X,
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
import { channelApi, chatApi } from "../../api/chatApi";
import type { ApiChannel, ApiChat } from "../../api/chatApi";
import { getSocket } from "../../api/socket";


interface TeamMember {
  id?: string;
  user_id?: string;
  UserId?: string;
  name?: string;
  user_full_name?: string;
  email?: string;
  role?: string;
  user_role?: string;
  role_name?: string;
  RoleName?: string;
}

interface Team {
  id?: string;
  group_id?: string;
  name: string;
  description?: string;
  inviteCode?: string;
  members: TeamMember[];
  bigTasks?: unknown[];
}

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  isDefault: boolean;
}

interface Message {
  id: string;
  userId: string;
  user: string;
  message: string;
  time: string;
  date: string; 
  isOwn: boolean;
}


const toChannel = (a: ApiChannel): Channel => ({
  id: a.channel_id,
  name: a.channel_name,
  isPrivate: false,
  isDefault: false,
});

const toMessage = (a: ApiChat, currentUserId: string): Message => {
  const d = a.audited_time ? new Date(a.audited_time) : new Date();
  return {
    id: a.chat_id,
    userId: a.user_id,
    user: a.user_full_name ?? "Unknown",
    message: a.chat_message,
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, // "YYYY-MM-DD"
    isOwn: a.user_id === currentUserId,
  };
};

export function Chat() {
  const navigate = useNavigate();

  const { activeTeam, teams, currentUser } = useOutletContext<{
    activeTeam: string;
    teams: Team[];
    currentUser: { id: string; name: string };
  }>();

  const activeTeamData = teams.find((t) => t.name === activeTeam);
  const members: TeamMember[] = activeTeamData?.members ?? [];

  const groupId = activeTeamData?.group_id || activeTeamData?.id || "";
  const userId  = currentUser?.id ?? "";

  const [channels,        setChannels]        = useState<Channel[]>([]);
  const [messages,        setMessages]        = useState<Message[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>("");
  const [message,         setMessage]         = useState("");

  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMsg,      setSendingMsg]      = useState(false);
  const [apiError,        setApiError]        = useState<string | null>(null);

  const [createOpen,  setCreateOpen]  = useState(false);
  const [channelName, setChannelName] = useState("");
  const [nameError,   setNameError]   = useState("");
  const [creatingCh,  setCreatingCh]  = useState(false);

  const [editingMsgId,   setEditingMsgId]   = useState<string | null>(null);
  const [editingMsgText, setEditingMsgText] = useState("");
  const [savingEdit,     setSavingEdit]     = useState(false);

  const scrollRef            = useRef<HTMLDivElement>(null);
  const inputRef             = useRef<HTMLInputElement>(null);
  const inputFocused         = useRef(false);
  const initialLoadDone      = useRef(false);
  const shouldScrollToBottom = useRef(false); 

  const selectedChannel = channels.find((c) => c.id === activeChannelId);


  const fetchChannels = useCallback(async () => {
    if (!groupId) return;
    setLoadingChannels(true);
    setApiError(null);
    try {
      const res = await channelApi.getByGroup(groupId);
      const list = (res.data ?? []).map(toChannel);
      setChannels(list);
      setActiveChannelId((prev) =>
        list.find((c) => c.id === prev) ? prev : list[0]?.id ?? ""
      );
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Gagal memuat channel");
    } finally {
      setLoadingChannels(false);
    }
  }, [groupId]);

  useEffect(() => {
    setChannels([]);
    setMessages([]);
    setActiveChannelId("");
    fetchChannels();
  }, [fetchChannels]);

  const fetchMessages = useCallback(async () => {
    if (!groupId || !activeChannelId) return;

    const isInitial = !initialLoadDone.current;

    if (isInitial) {
      setLoadingMessages(true);
    }

    try {
      const res = await chatApi.getByChannel(groupId, activeChannelId);
      const incoming = (res.data ?? []).map((m) => toMessage(m, userId));

      if (isInitial) {
        shouldScrollToBottom.current = true;
      }

      setMessages((prev) => {
        const optimistics = prev.filter((m) => m.id.startsWith("opt-"));
        const incomingIds = new Set(incoming.map((m) => m.id));
        const pendingOpts = optimistics.filter((o) => !incomingIds.has(o.id));
        return [...incoming, ...pendingOpts];
      });

      initialLoadDone.current = true;
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Gagal memuat pesan");
    } finally {
      setLoadingMessages(false);
    }
  }, [groupId, activeChannelId, userId]);

  useEffect(() => {
    setMessages([]);
    initialLoadDone.current = false; 
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (!groupId || !activeChannelId) return;
    const socket = getSocket();
    socket.emit("joinChannel", { group_id: groupId, channel_id: activeChannelId });

    const onNew = (payload: ApiChat) => {
      if (String(payload.channel_id) !== String(activeChannelId)) return;

      setMessages((prev) => {
        const isAlreadyExists = prev.some((m) => m.id === payload.chat_id);
        if (isAlreadyExists) return prev;

        const optimisticIndex = prev.findIndex(
          (m) =>
            m.id.startsWith("opt-") &&
            m.message === payload.chat_message &&
            m.userId === payload.user_id
        );

        if (optimisticIndex !== -1) {
          const updatedMessages = [...prev];
          updatedMessages[optimisticIndex] = toMessage(payload, userId);
          return updatedMessages;
        }

        return [...prev, toMessage(payload, userId)];
      });
    };

    socket.on("chat:new", onNew);

    return () => {
      socket.emit("leaveChannel", { group_id: groupId, channel_id: activeChannelId });
      socket.off("chat:new", onNew);
    };
  }, [groupId, activeChannelId, userId]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (shouldScrollToBottom.current) {
      el.scrollTop = el.scrollHeight;
      shouldScrollToBottom.current = false;
    } else {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (isNearBottom) el.scrollTop = el.scrollHeight;
    }

    if (inputFocused.current && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const initials = (name: string) =>
    (name || "U").trim().split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const formatDateLabel = (dateStr: string): string => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    const yesterday = `${yest.getFullYear()}-${String(yest.getMonth()+1).padStart(2,'0')}-${String(yest.getDate()).padStart(2,'0')}`;
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedChannel || !groupId || !userId) return;
    setSendingMsg(true);

    const currentMsgText = message.trim();
    const optimisticId = `opt-${Date.now()}`;

    const optimistic: Message = {
      id: optimisticId,
      userId,
      user: currentUser?.name ?? "You",
      message: currentMsgText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().slice(0, 10),
      isOwn: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setMessage("");
    shouldScrollToBottom.current = true; 

    try {
      await chatApi.send(groupId, userId, activeChannelId, currentMsgText);
    } catch (err: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setApiError(err instanceof Error ? err.message : "Gagal mengirim pesan");
    } finally {
      setSendingMsg(false);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  const startEdit = (msg: Message) => {
    setEditingMsgId(msg.id);
    setEditingMsgText(msg.message);
  };
  const cancelEdit = () => { setEditingMsgId(null); setEditingMsgText(""); };

  const handleSaveEdit = async (msg: Message) => {
    if (!editingMsgText.trim() || editingMsgText === msg.message) { cancelEdit(); return; }
    setSavingEdit(true);
    try {
      await chatApi.update(msg.id, userId, editingMsgText.trim());
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, message: editingMsgText.trim() } : m)
      );
      cancelEdit();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Gagal mengupdate pesan");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteMessage = async (msg: Message) => {
    try {
      await chatApi.delete(msg.id, userId);
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Gagal menghapus pesan");
    }
  };

  const handleCreateChannel = async () => {
    const trimmedInput = channelName.trim();
    if (!trimmedInput) { setNameError("Channel name cannot be empty."); return; }
    if (trimmedInput.split(/\s+/).length > 3) { setNameError("Maximum limit is 3 words."); return; }
    const slug = slugify(channelName);
    if (channels.some((c) => c.name === slug)) { setNameError(`#${slug} already exists.`); return; }

    if (!groupId) { setNameError("No active team selected. Please select a team first."); return; }
    if (!userId)  { setNameError("Session expired. Please log in again."); return; }

    setCreatingCh(true);
    try {
      await channelApi.create(groupId, userId, slug);
      await fetchChannels();
      setCreateOpen(false);
      setChannelName("");
      setNameError("");
    } catch (err: unknown) {
      setNameError(err instanceof Error ? err.message : "Gagal membuat channel");
    } finally {
      setCreatingCh(false);
    }
  };

  const handleDeleteChannel = async (ch: Channel) => {
    try {
      await channelApi.delete(ch.id, groupId, userId);
      await fetchChannels();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Gagal menghapus channel");
    }
  };

  if (teams.length === 0) {
    return (
      <div className="p-6 h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-6">
            <Users className="w-12 h-12 text-indigo-300 dark:text-indigo-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            You haven't joined any team yet
          </h2>
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

      {apiError && (
        <div className="mb-3 flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{apiError}</span>
          <button onClick={() => setApiError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm select-none">#</span>
                <Input
                  id="ch-name"
                  placeholder="e.g. backend api design"
                  value={channelName}
                  onChange={(e) => { setChannelName(e.target.value); if (nameError) setNameError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateChannel()}
                  className={`rounded-xl pl-7 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 ${
                    nameError ? "border-red-400 focus-visible:ring-red-400" : ""
                  }`}
                />
              </div>
              {nameError ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {nameError}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Maximum 3 words. Lowercase, numbers, and hyphens only.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={!channelName.trim() || creatingCh}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white disabled:opacity-40"
            >
              {creatingCh ? "Creating…" : "Create Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">

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

                  {loadingChannels ? (
                    <p className="text-xs text-slate-400 px-3 py-4 text-center">Loading channels…</p>
                  ) : (
                    <div className="space-y-0.5">
                      {channels.map((ch) => {
                        const isActive = ch.id === activeChannelId;
                        return (
                          <div
                            key={ch.id}
                            className={`flex items-center justify-between w-[224px] max-w-[224px] p-1 rounded-lg transition-colors gap-1 ${
                              isActive
                                ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <button
                              onClick={() => setActiveChannelId(ch.id)}
                              className="flex items-center gap-2 px-2 py-1 flex-1 w-0 text-sm text-left"
                            >
                              <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                              <span className="block truncate w-full" title={ch.name}>{ch.name}</span>
                            </button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-all shrink-0 ml-auto ${
                                    isActive
                                      ? "text-red-200 hover:text-red-100 hover:bg-white/20"
                                      : "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-slate-900 dark:text-white">
                                    Delete #{ch.name}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                                    All messages will be permanently deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2 sm:gap-0">
                                  <AlertDialogCancel className="mt-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteChannel(ch)}
                                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-none shadow-sm transition-colors"
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
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/20 border-r border-slate-200 dark:border-slate-800">
              {selectedChannel ? (
                <>
                  <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-5 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                      <h3 className="font-semibold truncate">{selectedChannel.name}</h3>
                    </div>
                  </div>

                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-slate-400">Loading messages…</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <h3 className="font-semibold text-lg">Welcome to #{selectedChannel.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">Send the first message!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, idx) => {
                          const prevMsg = messages[idx - 1];
                          const showDateSeparator = !prevMsg || prevMsg.date !== msg.date;
                          return (
                            <div key={msg.id}>
                              {showDateSeparator && (
                                <div className="flex items-center gap-3 my-4">
                                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 whitespace-nowrap">
                                    {formatDateLabel(msg.date)}
                                  </span>
                                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                </div>
                              )}

                              <div className={`flex gap-3 group ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                                <Avatar className="w-9 h-9 flex-shrink-0">
                                  <AvatarFallback className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                    {initials(msg.user)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className={`flex-1 max-w-[70%] ${msg.isOwn ? "flex flex-col items-end" : ""}`}>
                                  <div className={`flex items-center gap-2 mb-1 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                                    <span className="text-xs text-slate-400">{msg.user}</span>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{msg.time}</span>
                                  </div>

                                  {editingMsgId === msg.id ? (
                                    <div className="flex items-center gap-2 w-full">
                                      <Input
                                        value={editingMsgText}
                                        onChange={(e) => setEditingMsgText(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleSaveEdit(msg);
                                          if (e.key === "Escape") cancelEdit();
                                        }}
                                        className="rounded-xl text-sm bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-700"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleSaveEdit(msg)}
                                        disabled={savingEdit}
                                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-end gap-1.5 group/bubble">
                                      {msg.isOwn && (
                                        <div className="flex gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity mb-0.5">
                                          <button
                                            onClick={() => startEdit(msg)}
                                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500"
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </button>

                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <button className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500">
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl">
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                                                  This action cannot be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => handleDeleteMessage(msg)}
                                                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      )}

                                      <div className={`inline-block px-4 py-2 rounded-xl text-sm ${
                                        msg.isOwn
                                          ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                      }`}>
                                        {msg.message}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      <Input
                        ref={inputRef}
                        placeholder={`Message #${selectedChannel.name}`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => { inputFocused.current = true; }}
                        onBlur={() => { inputFocused.current = false; }}
                        onKeyDown={(e) => e.key === "Enter" && !sendingMsg && handleSend()}
                        disabled={sendingMsg}
                        className="rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!message.trim() || sendingMsg}
                        className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Hash className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <h3 className="font-semibold text-lg">No channels available</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-4">
                    Click the plus icon on the sidebar to create your first channel.
                  </p>
                  <Button
                    onClick={() => setCreateOpen(true)}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white gap-1"
                  >
                    <Plus className="w-4 h-4" /> Create Channel
                  </Button>
                </div>
              )}
            </div>

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
                  <p className="text-center text-xs text-slate-400 py-8">No members in this team</p>
                ) : (
                  <div className="space-y-1 pt-2">
                    {members.map((member) => {
                      const memId = member.user_id || member.UserId || member.id;
                      const memName = member.user_full_name || member.name || "Unknown User";
                      const rawRole = String(member.user_role || member.role || member.role_name || member.RoleName || "").toLowerCase();
                      const displayRole = (rawRole === "a" || rawRole.includes("admin")) ? "Admin" : "Member";

                      return (
                        <div
                          key={memId}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <div className="relative shrink-0">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                {initials(memName)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{memName}</p>
                            <p className="text-[10px] text-slate-400 capitalize truncate">
                              {displayRole}
                            </p>
                          </div>
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