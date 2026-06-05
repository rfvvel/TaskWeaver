import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ListTodo, Calendar as CalendarIcon, Activity,
  FolderOpen, MessageSquare, Settings as SettingsIcon, ChevronDown,
  Users, ClipboardList, Sun, Moon, CalendarDays
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
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
  { path: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
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
  const navigate = useNavigate();
 
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<string>("Loading...");
  const [loading, setLoading] = useState<boolean>(true);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark") || 
           localStorage.getItem("theme") === "dark";
  });

  // Sinkronisasi mendengarkan event dari Settings.tsx
  useEffect(() => {
    const handleThemeUpdated = () => {
      const currentTheme = localStorage.getItem("theme") === "dark" || 
                           document.documentElement.classList.contains("dark");
      setIsDarkMode(currentTheme);
    };

    window.addEventListener("tw_theme_updated", handleThemeUpdated);
    return () => window.removeEventListener("tw_theme_updated", handleThemeUpdated);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
    // Memicu event agar halaman Settings ikut ter-update jika tombol ini diklik
    window.dispatchEvent(new Event("tw_theme_updated"));
  };
  
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
 
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
  const [userFullName, setUserFullName] = useState<string>(
    user.UserFullName ?? user.user_full_name ?? localStorage.getItem("name") ?? "User"
  );

  useEffect(() => {
    const handleUserUpdated = () => {
      const u = getUser();
      setUserFullName(u.UserFullName ?? u.user_full_name ?? localStorage.getItem("name") ?? "User");
    };
    window.addEventListener("tw_user_updated", handleUserUpdated);
    return () => window.removeEventListener("tw_user_updated", handleUserUpdated);
  }, []);
 
  const avatarInitials: string =
    userFullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join("") || "Y";
 
  const resolvedUserId = user.UserID ?? user.user_id ?? user.id ?? "";
 
  const currentUser = {
    id: resolvedUserId,
    user_id: resolvedUserId,
    name: userFullName,
    email: user.UserEmail ?? user.email ?? "",
  };
 
  useEffect(() => {
    const fetchUserTeams = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/api/groupGetGroupByUserId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: currentUser.user_id }),
        });
 
        if (!response.ok) throw new Error("Backend error response");
        const resData = await response.json();
 
        if (resData && resData.status === "sukses" && Array.isArray(resData.data)) {
          const baseTeams: Team[] = resData.data.map((t: any) => ({
            group_id: String(t.group_id ?? ""),
            name: t.group_name ?? t.name ?? "",
            description: t.group_description ?? t.description ?? "",
            inviteCode: t.invite_code ?? "",
            bigTasks: [],
            members: [],
          }));
 
          const teamsWithMembers: Team[] = await Promise.all(
            baseTeams.map(async (team) => {
              try {
                const mRes = await fetch("http://localhost:3000/api/groupGetMember", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ group_id: team.group_id }),
                });
                const mData = await mRes.json();
                const members: TeamMember[] =
                  mRes.ok && mData.status === "sukses" && Array.isArray(mData.data)
                    ? mData.data.map((m: any) => {
                        const uid = String(m.user_id ?? "");
                        const role = ((m.user_role ?? m.role ?? "member") as string).toLowerCase();
                        return {
                          id: uid,
                          user_id: uid,
                          name: m.user_full_name ?? m.name ?? "Unknown",
                          email: m.user_email ?? m.email ?? "",
                          role: (role === "admin" || role === "a" ? "admin" : "member") as "admin" | "member",
                          avatarSeed: uid,
                          joinDate: m.joined_at ?? "",
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
        setTeams([]);
        setActiveTeam("No Team");
      } finally {
        setLoading(false);
      }
    };
 
    if (currentUser.user_id) {
      fetchUserTeams();
    }
  }, [currentUser.user_id]);
 
  const handleTeamChange = (teamName: string) => {
    setActiveTeam(teamName);
    localStorage.setItem("tw_activeTeam", teamName);
  };
 
  return (
    <div className="flex h-screen bg-background">
      {/* SIDEBAR LEFT */}
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
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
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
 
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER TOP */}
        <header className="h-20 bg-card border-b border-border shadow-sm flex items-center justify-between px-6 shrink-0">
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={loading || teams.length === 0}>
                <Button variant="outline" className="gap-2 rounded-xl border-border bg-background hover:bg-accent">
                  <span className="text-sm font-semibold text-foreground">{loading ? "Loading..." : activeTeam}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 z-50 shadow-lg">
                <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {teams.map((team, idx) => (
                  <DropdownMenuItem
                    key={team.group_id || idx}
                    onClick={() => handleTeamChange(team.name)}
                    className="cursor-pointer font-medium"
                  >
                    {team.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
 
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-xl border-border bg-background hover:bg-accent text-foreground shadow-sm"
              title={isDarkMode ? "Active: Dark Mode" : "Active: Light Mode"}
            >
              {/* DI SINI SUDAH DITUKAR: Jika isDarkMode aktif tampilkan Moon, jika Light aktif tampilkan Sun */}
              {isDarkMode ? (
                <Moon className="w-[18px] h-[18px] text-blue-400 animate-pulse" />
              ) : (
                <Sun className="w-[18px] h-[18px] text-amber-500" />
              )}
            </Button>

            <div 
              onClick={() => navigate("/calendar")} 
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-muted/60 border border-border/60 shadow-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-800 transition-all active:scale-95"
              title="Go to Calendar"
            >
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-foreground tracking-wide">{formattedDate}</span>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>
          
        </header>
 
        {/* VIEW ROUTER */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet context={{ activeTeam, setActiveTeam, teams, setTeams, currentUser }} />
        </main>
      </div>
    </div>
  );
}