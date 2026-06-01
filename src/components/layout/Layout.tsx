
import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ListTodo, Calendar as CalendarIcon, Activity,
  FolderOpen, MessageSquare, Settings as SettingsIcon, Search, Bell, ChevronDown,
  Users, ClipboardList, AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import LogoTW2 from "./LogoTW2.png";
 
interface BigTask {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "completed";
  deadline: string;
}
 
interface TeamMember {
  user_id: string; 
  name: string;
  email: string;
  role: "admin" | "member";
  avatarSeed: string;
  joinDate: string;
}
 
interface Team {
  group_id: string; 
  name: string;
  description: string;
  inviteCode: string;
  members: TeamMember[];
  bigTasks: BigTask[];
}
 
const navItems = [
  { path: "/dashboard",       label: "Dashboard",      icon: LayoutDashboard },
  { path: "/tasks",           label: "My Tasks",        icon: ListTodo },
  { path: "/calendar",        label: "Calendar",        icon: CalendarIcon },
  { path: "/activity",        label: "Team Activity",   icon: Activity },
  { path: "/files",           label: "Files",           icon: FolderOpen },
  { path: "/chat",            label: "Chat",            icon: MessageSquare },
  { path: "/team-management", label: "Team Management", icon: Users },
  { path: "/task-management", label: "Task Management", icon: ClipboardList },
  { path: "/settings",        label: "Settings",        icon: SettingsIcon },
];
 
export function Layout() {
  const location = useLocation();
  const navigate  = useNavigate();
 
  // ── Ambil Data Profil dari Semua Kemungkinan Key LocalStorage ──────────────────
  const getUser = () => {
    try { 
      const rawUser = localStorage.getItem("user");
      if (rawUser) return JSON.parse(rawUser);
      return {
        user_full_name: localStorage.getItem("name") || localStorage.getItem("fullName") || "",
        user_id: localStorage.getItem("user_id") || localStorage.getItem("id") || "",
        email: localStorage.getItem("email") || ""
      };
    } catch { 
      return {}; 
    }
  };
 
  const user = getUser();
  
  // Mengunci nama agar sinkron dengan menu Settings Anda ("yuriqe non")
  // UserModel menyimpan sebagai UserFullName (PascalCase)
  const userFullName: string = user.UserFullName ?? user.user_full_name ?? localStorage.getItem("name") ?? "User";
 
  const avatarInitials: string =
    userFullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join("") || "Y";
 
  // user_id — UserModel menyimpan sebagai UserID (PascalCase)
  const resolvedUserId = user.UserID ?? user.user_id ?? user.id ?? "";
 
  // WAJIB ada field "id" karena Chat.tsx pakai currentUser.id untuk isOwn & API calls
  const currentUser = {
    id:      resolvedUserId,
    user_id: resolvedUserId,
    name:    userFullName,
    email:   user.UserEmail ?? user.email ?? "",
  };
 
  // ── State Utama ────────────────────────────────────────────────────────────
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<string>("Loading...");
  const [loading, setLoading] = useState<boolean>(true);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false);
 
  // ── Ambil Data Tim + Members Dari Backend ────────────────────────────────────
  useEffect(() => {
    const fetchUserTeams = async () => {
      setLoading(true);
      setIsLocalMode(false);
      try {
        // Step 1: Ambil semua group milik user
        const response = await fetch("http://localhost:3000/api/groupGetGroupByUserId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: currentUser.user_id }),
        });
 
        if (!response.ok) throw new Error("Backend error response");
        const resData = await response.json();
 
        if (resData && resData.status === "sukses" && Array.isArray(resData.data)) {
          const baseTeams: Team[] = resData.data.map((t: any) => ({
            group_id:    String(t.group_id ?? ""),
            name:        t.group_name ?? t.name ?? "",
            description: t.group_description ?? t.description ?? "",
            inviteCode:  t.invite_code ?? "",
            bigTasks:    [],
            members:     [],
          }));
 
          // Step 2: Fetch members tiap group secara paralel
          const teamsWithMembers: Team[] = await Promise.all(
            baseTeams.map(async (team) => {
              try {
                const mRes  = await fetch("http://localhost:3000/api/groupGetMember", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ group_id: team.group_id }),
                });
                const mData = await mRes.json();
                const members: TeamMember[] =
                  mRes.ok && mData.status === "sukses" && Array.isArray(mData.data)
                    ? mData.data.map((m: any) => {
                        const uid  = String(m.user_id ?? "");
                        const role = ((m.user_role ?? m.role ?? "member") as string).toLowerCase();
                        return {
                          id:         uid,
                          user_id:    uid,
                          name:       m.user_full_name ?? m.name ?? "Unknown",
                          email:      m.user_email ?? m.email ?? "",
                          role:       (role === "admin" ? "admin" : "member") as "admin" | "member",
                          avatarSeed: uid,
                          joinDate:   m.joined_at ?? "",
                        };
                      })
                    : [];
                return { ...team, members };
              } catch {
                return team;
              }
            })
          );
 
          setTeams(teamsWithMembers);
 
          const savedActive = localStorage.getItem("tw_activeTeam");
          if (savedActive && teamsWithMembers.some(t => t.name === savedActive)) {
            setActiveTeam(savedActive);
          } else if (teamsWithMembers.length > 0) {
            setActiveTeam(teamsWithMembers[0].name);
            localStorage.setItem("tw_activeTeam", teamsWithMembers[0].name);
          } else {
            setActiveTeam("No Team");
          }
        } else {
          throw new Error(resData.pesan || "Gagal mengambil data tim");
        }
      } catch (err) {
        console.error("Gagal terhubung ke backend:", err);
        setIsLocalMode(true);
        const defaultData: Team[] = [{
          group_id: "1",
          name: "aliran ilegal",
          description: "Software Engineering Project Team",
          inviteCode: "TW-8X9P2",
          bigTasks: [],
          members: [
            { user_id: "1", name: "yuriqe non", email: "darren123@gmail.com", role: "admin", avatarSeed: "y", joinDate: "" },
            { user_id: "2", name: "Steven lol",  email: "steven@gmail.com",    role: "admin", avatarSeed: "s", joinDate: "" },
          ],
        }];
        setTeams(defaultData);
        setActiveTeam("aliran ilegal");
      } finally {
        setLoading(false);
      }
    };
 
    fetchUserTeams();
  }, [currentUser.user_id]);
 
  const handleTeamChange = (teamName: string) => {
    setActiveTeam(teamName);
    localStorage.setItem("tw_activeTeam", teamName);
  };
 
  useEffect(() => {
    const saved = localStorage.getItem("tw_theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);
 
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <img src={LogoTW2} alt="TaskWeaver Logo" className="w-10 h-10 object-contain rounded-md" />
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">TaskWeaver</h1>
          </div>
        </div>
 
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
 
        <div className="p-4 border-t border-border">
          <div onClick={() => navigate("/settings")} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent cursor-pointer border border-transparent">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-bold text-sm">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userFullName}</p>
            </div>
          </div>
        </div>
      </aside>
 
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-card border-b border-border shadow-sm flex items-center justify-between px-6 shrink-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tasks…" className="pl-10 bg-muted rounded-xl" />
            </div>
          </div>
 
          <div className="flex items-center gap-3">
            {isLocalMode && (
              <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg text-xs border border-amber-200 dark:border-amber-900 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Local Mode (Fallback)</span>
              </div>
            )}
 
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={loading}>
                <Button variant="outline" className="gap-2 rounded-xl border-border">
                  <span className="text-sm">{loading ? "Loading..." : activeTeam}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50 shadow-lg">
                <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {teams.map((team, idx) => (
                  <DropdownMenuItem
                    key={team.group_id || idx} 
                    onClick={() => handleTeamChange(team.name)}
                    className="cursor-pointer"
                  >
                    {team.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
 
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="w-5 h-5 text-foreground/60" />
            </Button>
          </div>
        </header>
 
        <main className="flex-1 overflow-auto bg-background">
          <Outlet context={{ activeTeam, setActiveTeam, teams, setTeams, currentUser }} />
        </main>
      </div>
    </div>
  );
}