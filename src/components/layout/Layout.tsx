import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ListTodo, Brain, Calendar as CalendarIcon, Activity,
  FolderOpen, MessageSquare, Settings as SettingsIcon, Search, Bell, ChevronDown,
  Users, ClipboardList,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import LogoTW2 from "./LogoTW2.png";

// Interface dipindah ke sini
interface BigTask { id: string; title: string; status: "todo" | "in-progress" | "completed"; deadline: string; }
interface TeamMember { id: string; name: string; email: string; role: "admin" | "member"; avatarSeed: string; joinDate: string; }
interface Team { id: string; name: string; description: string; inviteCode: string; members: TeamMember[]; bigTasks: BigTask[]; }

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { path: "/tasks", label: "My Tasks", icon: ListTodo },
  // { path: "/ai-distribution", label: "AI Distribution", icon: Brain }, { path: "/calendar", label: "Calendar", icon: CalendarIcon },
  { path: "/activity", label: "Team Activity", icon: Activity }, { path: "/files", label: "Files", icon: FolderOpen },
  { path: "/chat", label: "Chat", icon: MessageSquare }, { path: "/team-management", label: "Team Management", icon: Users },
  { path: "/task-management", label: "Task Management", icon: ClipboardList }, { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Layout() {
  const location = useLocation();

  // 1. MENGAMBIL DATA DARI MEMORI BROWSER (LOCAL STORAGE)
  const [teams, setTeams] = useState<Team[]>(() => {
    const savedTeams = localStorage.getItem("tw_teams");
    if (savedTeams) return JSON.parse(savedTeams);
    // Data bawaan kalau baru pertama kali buka aplikasi
    return [
      {
        id: "team-1", name: "CS Project Team", description: "Software Engineering Final Project", inviteCode: "TW-8X9P2", bigTasks: [],
        members: [
          { id: "m1", name: "Lie Darren", email: "lie.darren@gmail.com", role: "admin", avatarSeed: "darren", joinDate: "Joined 1/15/2026" },
          { id: "m2", name: "Steven Nathaniel", email: "steven.nathaniel@gmail.com", role: "admin", avatarSeed: "steven", joinDate: "Joined 1/16/2026" },
        ]
      }
    ];
  });

  const [activeTeam, setActiveTeam] = useState(() => {
    return localStorage.getItem("tw_activeTeam") || (teams.length > 0 ? teams[0].name : "No Team");
  });

  // 2. OTOMATIS MENYIMPAN KE MEMORI JIKA ADA PERUBAHAN
  useEffect(() => {
    localStorage.setItem("tw_teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("tw_activeTeam", activeTeam);
  }, [activeTeam]);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <img src={LogoTW2} alt="TaskWeaver Logo" className="w-10 h-10 object-cover rounded-md mix-blend-multiply" />
            <h1 className="text-xl font-bold text-blue-600">TaskWeaver AI</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-muted-foreground hover:bg-slate-100 hover:text-slate-900"}`}>
                <Icon className="w-5 h-5" /> <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <Avatar className="w-9 h-9"><AvatarFallback>RV</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">Rafael</p></div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-card border-b border-border shadow-sm flex items-center justify-between px-6 shrink-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tasks, files, or members..." className="pl-10 bg-slate-50 border-border rounded-xl focus-visible:ring-blue-500" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-xl border-border">
                  <span className="text-sm">{activeTeam}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white z-50 shadow-lg border-slate-300" >
                <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-300"/>
                {/* RENDER DROPDOWN DINAMIS BERDASARKAN DATA TEAMS */}
                {teams.map((team) => (
                  <DropdownMenuItem key={team.id} onClick={() => setActiveTeam(team.name)} className="cursor-pointer">
                    {team.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-slate-100">
              <Bell className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">
          {/* MENGIRIM TEAMS & SETTEAMS KE HALAMAN ANAK */}
          <Outlet context={{ activeTeam, setActiveTeam, teams, setTeams }} />
        </main>
      </div>
    </div>
  );
}
