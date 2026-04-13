import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  Brain,
  Calendar as CalendarIcon,
  Activity,
  FolderOpen,
  MessageSquare,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import LogoTW2 from "./LogoTW2.png";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, 
  { path: "/tasks", label: "My Tasks", icon: ListTodo },
  { path: "/ai-distribution", label: "AI Distribution", icon: Brain },
  { path: "/calendar", label: "Calendar", icon: CalendarIcon },
  { path: "/activity", label: "Team Activity", icon: Activity },
  { path: "/files", label: "Files", icon: FolderOpen },
  { path: "/chat", label: "Chat", icon: MessageSquare },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        
        <div className="h-20 flex items-center px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <img 
              src={LogoTW2} 
              alt="TaskWeaver Logo" 
              className="w-10 h-10 object-cover rounded-md mix-blend-multiply" 
            />
            <h1 className="text-xl font-bold text-blue-600">
              TaskWeaver AI
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-slate-900"
                }`}>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <Avatar className="w-9 h-9">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=rafael" />
              <AvatarFallback>RD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Rafael</p>
              <p className="text-xs text-muted-foreground">Team Lead</p>
            </div>
          </div>
        </div>
      </aside>

 
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-card border-b border-border shadow-sm flex items-center justify-between px-6 shrink-0">
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, files, or members..."
                className="pl-10 bg-slate-50 border-border rounded-xl focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-xl border-border">
                  <span className="text-sm">CS Project Team</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>CS Project Team</DropdownMenuItem>
                <DropdownMenuItem>Marketing Campaign</DropdownMenuItem>
                <DropdownMenuItem>BINUS Blockchain Club</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-slate-100">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </Button>

            <Avatar className="w-9 h-9 cursor-pointer border border-border">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=rafael" />
              <AvatarFallback>RD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}