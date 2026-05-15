import { useState } from "react";
import { Send, Phone, Video, Smile, Paperclip, Hash, Lock, Users } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";

const channels = [
  { id: 1, name: "general", icon: Hash, unread: 0, private: false },
  { id: 2, name: "development", icon: Hash, unread: 3, private: false },
  { id: 3, name: "design", icon: Hash, unread: 1, private: false },
  { id: 4, name: "testing", icon: Hash, unread: 0, private: false },
  { id: 5, name: "project-leads", icon: Lock, unread: 2, private: true },
];

const messages = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    message: "Just finished the authentication flow mockups! 🎉",
    time: "10:30 AM",
    isOwn: false
  },
  {
    id: 2,
    user: "Michael Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    message: "Awesome work Sarah! The design looks great.",
    time: "10:32 AM",
    isOwn: false
  },
  {
    id: 3,
    user: "You",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    message: "Agreed! Love the color scheme you went with.",
    time: "10:35 AM",
    isOwn: true
  },
  {
    id: 4,
    user: "Emily Watson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    message: "I can start implementing the components tomorrow. Should have them ready by end of week.",
    time: "10:38 AM",
    isOwn: false
  },
  {
    id: 5,
    user: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    message: "I'll update the testing checklist to include the new auth flow.",
    time: "10:40 AM",
    isOwn: false
  },
  {
    id: 6,
    user: "You",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    message: "Perfect! Let's sync up tomorrow at 2 PM to discuss implementation details.",
    time: "10:42 AM",
    isOwn: true
  },
];

const activeMembers = [
  { name: "Sarah Chen", avatar: "sarah", status: "online", role: "Designer" },
  { name: "Michael Rodriguez", avatar: "michael", status: "online", role: "Backend Dev" },
  { name: "Emily Watson", avatar: "emily", status: "online", role: "Frontend Dev" },
  { name: "David Kim", avatar: "david", status: "away", role: "PM" },
  { name: "Alex Johnson", avatar: "alex", status: "online", role: "QA Engineer" },
];

export function Chat() {
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [message, setMessage] = useState("");
  const [isVoiceCall, setIsVoiceCall] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      setMessage("");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "online") return "bg-green-500";
    if (status === "away") return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="p-6">
      <Card className="border-border shadow-sm h-[calc(100vh-8rem)]">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Channels Sidebar */}
            <div className="w-64 border-r border-border flex flex-col">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground mb-1">Channels</h2>
                <p className="text-xs text-muted-foreground">CS Project Team</p>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-1">
                  {channels.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedChannel.id === channel.id
                            ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{channel.name}</span>
                        {channel.unread > 0 && (
                          <Badge className="bg-red-500 text-white h-5 px-1.5 text-xs">
                            {channel.unread}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="h-16 border-b border-border px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedChannel.name}</h3>
                    <p className="text-xs text-muted-foreground">5 members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-xl"
                    onClick={() => setIsVoiceCall(!isVoiceCall)}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Voice Call Banner */}
              {isVoiceCall && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Voice call in progress</p>
                        <p className="text-sm text-green-700">3 participants • 5:42</p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsVoiceCall(false)}
                      className="rounded-xl"
                    >
                      End Call
                    </Button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 max-w-md ${msg.isOwn ? "items-end" : ""}`}>
                        <div className={`flex items-baseline gap-2 mb-1 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                          <span className="font-medium text-sm text-foreground">{msg.user}</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <div
                          className={`inline-block px-4 py-2 rounded-xl ${
                            msg.isOwn
                              ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-tr-sm"
                              : "bg-accent text-foreground rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      className="rounded-xl pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSend}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Members Sidebar */}
            <div className="w-64 border-l border-border flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Active Members</h3>
                </div>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {activeMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="relative">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-card`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
