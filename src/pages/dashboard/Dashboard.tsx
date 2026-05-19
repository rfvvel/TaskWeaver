import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, Target, Calendar as CalendarIcon,
  Brain, AlertCircle, CheckCircle2, Clock, Shuffle, UserPlus,
  PlusCircle, Activity, ChevronRight,
  ListChecks, ArrowUpRight, Flame,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";


interface SubTask { id: string; title: string; assignedTo: string; avatarSeed: string; status: "todo" | "in-progress" | "completed"; }
interface Task { id: string; team: string; title: string; description: string; attachment: string | null; difficulty: string; dueDate: string; assignedTo: string | null; tags: string[]; status: string; subtasks: SubTask[]; }
interface BigTask { id: string; title: string; status: "todo" | "in-progress" | "completed"; deadline: string; }
interface TeamMember { id: string; name: string; email: string; role: "admin" | "member"; avatarSeed: string; joinDate: string; }
interface Team { id: string; name: string; description: string; inviteCode: string; members: TeamMember[]; bigTasks: BigTask[]; }

const TASKS_KEY = "tw_tasks";
const CURRENT_USER = "Lie Darren";

const WL_PATTERNS = [38, 65, 28, 52, 45, 72, 20, 58, 33, 61];
type WStatus = "under-utilized" | "balanced" | "slightly-high" | "overloaded";
const getWL = (i: number) => WL_PATTERNS[i % WL_PATTERNS.length];
const getWS = (w: number): WStatus => w < 35 ? "under-utilized" : w < 50 ? "balanced" : w < 63 ? "slightly-high" : "overloaded";
const barCls = (w: number) => w < 35 ? "bg-blue-400" : w < 50 ? "bg-green-500" : w < 63 ? "bg-amber-400" : "bg-red-500";
const txtCls = (w: number) => w < 35 ? "text-blue-600" : w < 50 ? "text-green-600" : w < 63 ? "text-amber-600" : "text-red-600";

function StatusBadge({ s }: { s: WStatus }) {
  const cls = { "balanced": "bg-green-50 text-green-700 border-green-200", "slightly-high": "bg-amber-50 text-amber-700 border-amber-200", "under-utilized": "bg-blue-50 text-blue-700 border-blue-200", "overloaded": "bg-red-50 text-red-700 border-red-200" };
  const lbl = { "balanced": "Balanced", "slightly-high": "Slightly High", "under-utilized": "Under-utilized", "overloaded": "Overloaded" };
  return <Badge variant="outline" className={`text-[10px] font-semibold ${cls[s]}`}>{lbl[s]}</Badge>;
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="relative mb-8">
        <div className="w-40 h-40 rounded-full border-2 border-dashed border-blue-200 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-2 border-dashed border-blue-300 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-200">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-400 animate-bounce" />
        <div className="absolute bottom-4 left-0 w-3 h-3 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">You're not part of any team yet</h2>
      <p className="text-slate-500 text-center max-w-sm mb-8">Create or join a team to start collaborating.</p>
      <div className="w-full max-w-xs flex gap-3">
       <Button
            onClick={() => navigate("/team-management")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white gap-2 w-full"
          >
            <UserPlus className="w-4 h-4" /> Create or Join a Team
          </Button>
      </div>
    </div>
  );
}

const MOCK_ACTIVITY = [
  { id: 1, type: "completed", user: "Lie Darren", action: "completed", target: "Video Editing & Render", time: "2 hours ago" },
  { id: 2, type: "started", user: "Steven Nathaniel", action: "started", target: "Video Taking / Shooting", time: "4 hours ago" },
  { id: 3, type: "completed", user: "Evan Varian", action: "completed", target: "Konsep & Planner Iklan", time: "1 day ago" },
];

function ActivityDot({ type }: { type: string }) {
  const bg = type === "completed" ? "bg-green-100" : type === "started" ? "bg-amber-100" : "bg-indigo-100";
  const ic = type === "completed" ? "text-green-600" : type === "started" ? "text-amber-500" : "text-indigo-500";
  const Icon = type === "completed" ? CheckCircle2 : Clock;
  return <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}><Icon className={`w-4 h-4 ${ic}`} /></div>;
}

export function Dashboard() {
  const { activeTeam, teams } = useOutletContext<{ activeTeam: string; teams: Team[] }>();
  const navigate = useNavigate();
  const [rebalanceModal, setRebalanceModal] = useState(false);

  const [allTasks, setAllTasks] = useState<Task[]>(() => {
    try { const r = localStorage.getItem(TASKS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
  });

  useEffect(() => {
    const refresh = () => {
      try { const r = localStorage.getItem(TASKS_KEY); if (r) setAllTasks(JSON.parse(r)); } catch {}
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); };
  }, []);

  if (!teams || teams.length === 0) return <EmptyState />;

  const team = teams.find((t) => t.name === activeTeam) ?? teams[0];
  const teamTasks = allTasks.filter((t) => t.team === team.name);
  const totalTasks = teamTasks.length;
  const completedTasks = teamTasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = teamTasks.filter((t) => t.status === "in-progress").length;
  const sprintProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const myDeadlines = teamTasks.flatMap((t) =>
    t.subtasks
      .filter((s) => s.assignedTo === CURRENT_USER && s.status !== "completed")
      .map((s) => ({
        id: s.id, taskId: t.id, title: s.title, bigTask: t.title, deadline: t.dueDate,
        priority: (t.difficulty === "expert" || t.difficulty === "hard") ? "high" : t.difficulty === "medium" ? "medium" : "low",
        status: s.status,
      }))
  );

  // Workload per member
  const membersWL = team.members.map((m, i) => {
    const w = getWL(i); return { ...m, workload: w, wStatus: getWS(w), tasks: Math.floor(w / 10) };
  });
  const overloaded = membersWL.find((m) => m.wStatus === "overloaded") ?? membersWL[0];
  const under = membersWL.find((m) => m.wStatus === "under-utilized") ?? membersWL[membersWL.length - 1];
  const hasOverload = membersWL.some((m) => m.wStatus === "overloaded");
  const hasHigh = membersWL.some((m) => m.wStatus === "overloaded" || m.wStatus === "slightly-high");

  const priCls = (p: string) => p === "high" ? "bg-red-50 text-red-700 border-red-200" : p === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-500">
            Overview for <span className="font-semibold text-blue-600">{team.name}</span>
            {team.description && <span className="text-slate-400"> · {team.description}</span>}
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
          {team.members.length} member{team.members.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Team Members", value: team.members.length.toString(), sub: `${team.members.filter(m => m.role === "admin").length} admin(s)`, Icon: Users, accent: "bg-blue-500" },
          { label: "Total Tasks", value: totalTasks > 0 ? totalTasks.toString() : "—", sub: totalTasks > 0 ? `${inProgressTasks} in progress` : "No tasks yet", Icon: Target, accent: "bg-blue-500" },
          { label: "Progress", value: totalTasks > 0 ? `${sprintProgress}%` : "—", sub: totalTasks > 0 ? `${completedTasks} of ${totalTasks} done` : "Create tasks first", Icon: TrendingUp, accent: "bg-blue-500" },
          { label: "My Deadlines", value: myDeadlines.length.toString(), sub: `${myDeadlines.filter(d => d.priority === "high").length} high priority`, Icon: CalendarIcon, accent: "bg-blue-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.sub}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.accent} flex items-center justify-center shadow-lg`}>
                  <s.Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sprint task list */}
      {teamTasks.length > 0 ? (
        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base"><ListChecks className="w-5 h-5 text-indigo-600" />Sprint Tasks</CardTitle>
                <CardDescription>Tasks created for {team.name}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs" onClick={() => navigate("/task-management")}>
                Manage <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {teamTasks.slice(0, 5).map((task) => {
              const done = task.subtasks.filter((s) => s.status === "completed").length;
              const ttl = task.subtasks.length;
              return (
                <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors cursor-pointer" onClick={() => navigate("/task-management")}>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.status === "completed" ? "bg-green-500" : task.status === "in-progress" ? "bg-blue-500" : "bg-slate-300"}`} />
                  <p className={`text-sm flex-1 font-medium ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}>{task.title}</p>
                  {ttl > 0 && <span className="text-xs text-slate-400">{done}/{ttl} sub-tasks</span>}
                  <Badge variant="outline" className={`text-[10px] ${task.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : task.status === "in-progress" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500"}`}>
                    {task.status}
                  </Badge>
                </div>
              );
            })}
            {teamTasks.length > 5 && <p className="text-xs text-slate-400 text-center pt-1">+{teamTasks.length - 5} more</p>}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-slate-200 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center"><ListChecks className="w-6 h-6 text-indigo-400" /></div>
            <p className="text-sm text-slate-500">No tasks yet for <span className="text-slate-700 font-medium">{team.name}</span></p>
            <Button size="sm" variant="outline" className="gap-1 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => navigate("/task-management")}>
              <PlusCircle className="w-3.5 h-3.5" /> Add First Task
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workload + My Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload — 2 cols */}
        <Card className="lg:col-span-2 border-border bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-indigo-600" />AI Workload Distribution</CardTitle>
                <CardDescription>Member balance in {team.name}</CardDescription>
              </div>
              {/* Button renamed to "Rebalance" */}
              <Button size="sm" onClick={() => setRebalanceModal(true)} className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl shadow-md text-xs px-4 gap-1.5">
                <Shuffle className="w-3.5 h-3.5" /> Rebalance
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {membersWL.map((m) => (
              <div key={m.id} className={`p-4 rounded-xl border transition-all ${m.wStatus === "overloaded" ? "border-red-200 bg-red-50/40" : m.wStatus === "slightly-high" ? "border-amber-200 bg-amber-50/40" : "border-slate-100 bg-slate-50 hover:border-indigo-100"}`}>
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10 border border-white shadow-sm">
                    <AvatarFallback className={`text-sm font-semibold ${m.wStatus === "overloaded" ? "bg-red-100 text-red-700" : m.wStatus === "slightly-high" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.tasks} active tasks · {m.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge s={m.wStatus} />
                        <span className={`text-sm font-bold ${txtCls(m.workload)}`}>{m.workload}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full ${barCls(m.workload)} transition-all duration-700 rounded-full`} style={{ width: `${m.workload}%` }} />
                    </div>
                  </div>
                  {(m.wStatus === "overloaded" || m.wStatus === "slightly-high") && <Flame className="w-4 h-4 text-red-400 flex-shrink-0" />}
                </div>
              </div>
            ))}
            <div className={`flex items-center gap-2 p-3.5 rounded-xl border mt-2 ${hasOverload ? "bg-red-50 border-red-200" : hasHigh ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
              {hasOverload ? <><AlertCircle className="w-4 h-4 text-red-600" /><span className="text-sm font-medium text-red-700">Needs Rebalance</span></> :
               hasHigh ? <><AlertCircle className="w-4 h-4 text-amber-600" /><span className="text-sm font-medium text-amber-700">Consider Rebalancing</span></> :
               <><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-sm font-medium text-green-700">Workload Balanced</span></>}
            </div>
          </CardContent>
        </Card>

        {/* My Deadlines — AI Insight card removed */}
        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-orange-600" />My Deadlines</CardTitle>
            <CardDescription className="text-xs">Your sub-tasks in {team.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {myDeadlines.length > 0 ? myDeadlines.map((d) => (
              <div key={d.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 transition-all cursor-pointer group" onClick={() => navigate("/tasks")}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-semibold text-slate-800 flex-1 leading-snug group-hover:text-indigo-700 transition-colors">{d.title}</p>
                  <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${priCls(d.priority)}`}>{d.priority}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(d.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-[10px] text-indigo-500 font-medium truncate max-w-[80px]">{d.bigTask}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No pending deadlines!</p>
                <p className="text-[11px] text-slate-300 mt-1">Sub-tasks assigned to you will appear here.</p>
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-600 hover:bg-indigo-50 rounded-xl gap-1 mt-1" onClick={() => navigate("/tasks")}>
              View All My Tasks <ArrowUpRight className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity feed */}
      <Card className="border-border bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><Activity className="w-5 h-5 text-indigo-600" />Recent Activity</CardTitle>
              <CardDescription>Latest updates from {team.name}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs" onClick={() => navigate("/activity")}>
              See All <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {MOCK_ACTIVITY.map((a) => (
              <div key={a.id} className="flex items-start gap-3 min-w-[240px] p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-100 hover:bg-white transition-all flex-shrink-0">
                <ActivityDot type={a.type} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-800"><span className="font-semibold">{a.user}</span> <span className="text-slate-500">{a.action}</span> <span className="font-medium">"{a.target}"</span></p>
                  <p className="text-[11px] text-slate-400 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rebalance Modal */}
      <Dialog open={rebalanceModal} onOpenChange={setRebalanceModal}>
        <DialogContent className="max-w-xl bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl"><Shuffle className="w-5 h-5 text-indigo-600" />Rebalance Preview</DialogTitle>
            <DialogDescription>AI will redistribute tasks to balance workload in <span className="font-semibold text-slate-700">{team.name}</span></DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4 border-t border-slate-100 mt-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700">From (Overloaded)</h4>
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-red-100"><AvatarFallback className="bg-white text-red-600 font-semibold">{overloaded?.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{overloaded?.name}</p>
                    <p className="text-sm text-slate-500">Current: <span className="text-red-600 font-medium">{overloaded?.workload}%</span> → Target: <span className="text-green-600 font-medium">45%</span></p>
                  </div>
                  <Badge variant="destructive" className="px-3 py-1">-2 tasks</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700">To (Available Capacity)</h4>
              <div className="p-4 rounded-xl border border-green-200 bg-green-50/50">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-green-100"><AvatarFallback className="bg-white text-green-600 font-semibold">{under?.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{under?.name}</p>
                    <p className="text-sm text-slate-500">Current: <span className="text-blue-600 font-medium">{under?.workload}%</span> → Target: <span className="text-green-600 font-medium">42%</span></p>
                  </div>
                  <Badge className="bg-green-600 px-3 py-1">+2 tasks</Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setRebalanceModal(false)} className="rounded-xl">Cancel</Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl shadow-md px-6" onClick={() => setRebalanceModal(false)}>Confirm Rebalance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
