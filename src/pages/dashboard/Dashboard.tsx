import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, Target, Calendar as CalendarIcon,
  Brain, CheckCircle2, Clock, Shuffle, UserPlus,
  Activity, ChevronRight, ListChecks, ArrowUpRight, Loader2
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";

const API = "https://projecttaskweaverbackend-production.up.railway.app/api";

interface MyTask {
  id: number;
  taskId: number;
  title: string;
  bigTaskTitle: string;
  deadline: string;
  status: string;
}

function ActivityDot({ type }: { type: string }) {
  const isStarted = type?.toLowerCase().includes("in-progress") || type?.toLowerCase().includes("start");
  const isCompleted = type?.toLowerCase().includes("completed") || type?.toLowerCase().includes("c");
  
  const bg = isCompleted ? "bg-green-100 dark:bg-green-950/50" : isStarted ? "bg-amber-100 dark:bg-amber-950/50" : "bg-indigo-100 dark:bg-indigo-950/50";
  const ic = isCompleted ? "text-green-600 dark:text-green-400" : isStarted ? "text-amber-500 dark:text-amber-400" : "text-indigo-500 dark:text-indigo-400";
  const Icon = isCompleted ? CheckCircle2 : Clock;
  
  return <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}><Icon className={`w-4 h-4 ${ic}`} /></div>;
}

export function Dashboard() {
  const { activeTeam, teams } = useOutletContext<{ activeTeam: string; teams: any[] }>();
  const navigate = useNavigate();
  
  const [rebalanceModal, setRebalanceModal] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.UserID || currentUser?.user_id || currentUser?.id || null;

  const currentTeam = teams?.find((t: any) => t.name === activeTeam);
  const groupId = currentTeam?.group_id || currentTeam?.id;

  const [members, setMembers] = useState<any[]>([]); 
  const [teamTasks, setTeamTasks] = useState<any[]>([]); 
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [activities, setActivities] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!groupId || !currentUserId) return;
    setLoading(true);

    try {
      const resMembers = await fetch(`${API}/groupGetMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId }),
      });
      const dataMembers = await resMembers.json();
      if (dataMembers.status === "sukses") setMembers(dataMembers.data || []);

      const resTeamTasks = await fetch(`${API}/detailTaskGetByGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId }),
      });
      const dataTeamTasks = await resTeamTasks.json();

      if (dataTeamTasks.status === "sukses") {
        const allTasks = dataTeamTasks.data || [];
        setTeamTasks(allTasks);

        const myTasksInThisTeam = allTasks.filter((t: any) => 
          String(t.UserId || t.user_id) === String(currentUserId)
        );

        const formattedTasks: MyTask[] = myTasksInThisTeam.map((t: any) => ({
          id: t.DetailTaskId || t.detail_task_id,
          taskId: t.TaskId || t.task_id,
          title: t.DetailTaskName || t.detail_task_name,
          bigTaskTitle: `Task #${t.TaskId || t.task_id}`,
          deadline: t.DetailTaskDeadline || t.detail_task_deadline,
          status: t.DetailTaskStatus || t.detail_task_status || "todo",
        }));
        setMyTasks(formattedTasks);
      }

      const resActivity = await fetch(`${API}/getActivityByGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId }),
      });
      const dataActivity = await resActivity.json();
      if (dataActivity.status === "sukses") {
        setActivities(dataActivity.data || []);
      }

    } catch (err) {
      console.error("Gagal fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId, currentUserId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const membersCount = members.length;
  
  const currentUserData = members.find(m => String(m.user_id) === String(currentUserId) || String(m.UserId) === String(currentUserId));
  const rawRole = String(currentUserData?.user_role || currentUserData?.role || currentUserData?.role_name || currentUserData?.RoleName || "").toLowerCase();
  const isUserAdmin = rawRole === "a" || rawRole.includes("admin");

  const totalMyTasks = myTasks.length; 
  const completedMyTasks = myTasks.filter(t => t.status === "completed" || t.status === "C").length;
  const pendingMyTasks = myTasks.filter(t => t.status !== "completed" && t.status !== "C");
  const progressPercent = totalMyTasks > 0 ? Math.round((completedMyTasks / totalMyTasks) * 100) : 0;

  const memberStats = members.map((m) => {
    const memId = String(m.user_id || m.UserId);
    const mTasks = teamTasks.filter(t => String(t.user_id || t.UserId) === memId);
    
    const mTotal = mTasks.length;
    const mComplete = mTasks.filter(t => 
      (t.detail_task_status || t.DetailTaskStatus) === "completed" || 
      (t.detail_task_status || t.DetailTaskStatus) === "C"
    ).length;
    const mPending = mTotal - mComplete;
    const mProgress = mTotal > 0 ? Math.round((mComplete / mTotal) * 100) : 0;

    const rRole = String(m.user_role || m.role || "").toLowerCase();
    const displayRole = (rRole === "a" || rRole.includes("admin")) ? "Admin" : "Member";

    return { 
      id: memId, 
      name: m.user_full_name || m.name || `User ${memId}`, 
      role: displayRole, 
      totalTasks: mTotal,
      completedTasks: mComplete,
      pendingTasks: mPending, 
      progress: mProgress
    };
  });

  const sortedByPending = [...memberStats].sort((a, b) => b.pendingTasks - a.pendingTasks);
  const overloaded = sortedByPending[0]; 
  const under = sortedByPending[sortedByPending.length - 1]; 

  const handleConfirmRebalance = async () => {
    if (!groupId) return;
    setIsRebalancing(true);
    
    try {
      const res = await fetch(`${API}/groupRebalance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId })
      });
      
      const json = await res.json();
      if (json.status === "sukses") {
        alert("Sukses: " + json.pesan);
        fetchDashboardData(); 
      } else {
        alert("Gagal rebalance: " + json.pesan);
      }
    } catch (err) {
      console.error("Error rebalance:", err);
      alert("Terjadi kesalahan pada server saat memanggil AI.");
    } finally {
      setIsRebalancing(false);
      setRebalanceModal(false);
    }
  };

  if (!groupId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">You're not in any active team</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Please select or join a team first.</p>
        <Button onClick={() => navigate("/team-management")} className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white">
          <UserPlus className="w-4 h-4 mr-2" /> Team Management
        </Button>
      </div>
    );
  }

  const metricCards = [
    { 
      label: "Team Members", 
      value: membersCount.toString(), 
      sub: "Total enrolled", 
      Icon: Users, 
      accent: "bg-blue-500",
      path: "/team-management",
      title: "View Team Management"
    },
    { 
      label: "Total Tasks", 
      value: totalMyTasks.toString(), 
      sub: "Total my tasks", 
      Icon: Target, 
      accent: "bg-blue-500",
      path: "/tasks",
      title: "View My Tasks"
    },
    { 
      label: "My Progress", 
      value: `${progressPercent}%`, 
      sub: `${completedMyTasks} of ${totalMyTasks} done`, 
      Icon: TrendingUp, 
      accent: "bg-blue-500",
      path: "/activity",
      title: "View Team Activity"
    },
    { 
      label: "My Deadlines", 
      value: pendingMyTasks.length.toString(), 
      sub: "Tasks left to do", 
      Icon: CalendarIcon, 
      accent: "bg-blue-500",
      path: "/calendar",
      title: "View Calendar"
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-1">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Overview for <span className="font-semibold text-blue-600 dark:text-blue-400">{activeTeam}</span>
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50 px-3 py-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
          {membersCount} Member{membersCount !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* 📊 GRID KARTU METRIK UTAMA DENGAN WARNA SERAGAM BIRU */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((s, idx) => (
          <Card 
            key={idx} 
            onClick={() => navigate(s.path)}
            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer active:scale-[0.98]"
            title={s.title}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{loading ? "-" : s.value}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{s.sub}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.accent} flex items-center justify-center shadow-lg dark:shadow-none transition-transform group-hover:scale-105`}>
                  <s.Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-50"><ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />My Active Tasks</CardTitle>
              <CardDescription className="dark:text-slate-400">Sub-tasks you need to complete</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 rounded-xl text-xs" onClick={() => navigate("/tasks")}>
              Manage <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {pendingMyTasks.length > 0 ? pendingMyTasks.map((task) => (
            <div key={task.id} onClick={() => navigate("/tasks")} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors cursor-pointer">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.status === "in-progress" ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{task.title}</p>
                <p className="text-[10px] text-slate-500 truncate">From: {task.bigTaskTitle}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${task.status === "in-progress" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50" : "bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400"}`}>
                {task.status}
              </Badge>
            </div>
          )) : (
             <div className="text-center py-6">
               <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
               <p className="text-sm font-medium text-slate-600 dark:text-slate-300">All caught up!</p>
               <p className="text-xs text-slate-400 mt-1">You have no pending tasks.</p>
             </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50"><Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />AI Workload Distribution</CardTitle>
              <CardDescription className="dark:text-slate-400">Team balance in {activeTeam}</CardDescription>
            </div>
            {isUserAdmin && (
              <Button size="sm" onClick={() => setRebalanceModal(true)} className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl shadow-md text-xs px-4 gap-1.5 dark:shadow-none">
                <Shuffle className="w-3.5 h-3.5" /> Rebalance
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberStats.map((member) => (
              <div key={member.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10 border border-white dark:border-slate-800 shadow-sm">
                    <AvatarFallback className="text-sm font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                      {member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{member.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.role}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{member.completedTasks}/{member.totalTasks} Tasks</span>
                    <span className={`font-bold ${member.progress === 100 && member.totalTasks > 0 ? "text-green-600" : "text-indigo-600 dark:text-indigo-400"}`}>
                      {member.progress}%
                    </span>
                  </div>
                  <Progress value={member.progress} className="h-1.5" />
                  <p className="text-[10px] text-slate-400 text-right mt-1 font-medium">Pending: {member.pendingTasks}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-50"><Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />Recent Activity</CardTitle>
              <CardDescription className="dark:text-slate-400">Latest updates from {activeTeam}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {activities.length > 0 ? activities.map((a, idx) => (
              <div key={a.log_id || idx} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-white dark:hover:bg-slate-900 transition-all">
                <ActivityDot type={a.action_type === 'I' || a.action_description?.toLowerCase().includes('start') ? 'started' : 'completed'} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-semibold">{a.user_full_name || "Sistem"}</span> <span className="text-slate-500 dark:text-slate-400">{a.action_description}</span> <span className="font-medium">"{a.task_title || "Group File"}"</span>
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    {new Date(a.audited_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )) : (
              <div className="flex items-center justify-center w-full py-6 text-slate-500 text-sm">
                No recent activity in this team.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={rebalanceModal} onOpenChange={setRebalanceModal}>
        <DialogContent className="max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded-2xl border dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-slate-50"><Shuffle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />Rebalance Preview</DialogTitle>
            <DialogDescription className="dark:text-slate-400">AI will redistribute pending tasks to balance workload in <span className="font-semibold text-slate-700 dark:text-slate-300">{activeTeam}</span></DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4 border-t border-slate-100 dark:border-slate-800 mt-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">From (Highest Pending)</h4>
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-red-100 dark:border-red-900">
                    <AvatarFallback className="bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-semibold">
                      {overloaded?.name ? overloaded.name.split(" ").map((n: string) => n[0]).join("") : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{overloaded?.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Current Pending: <span className="text-red-600 dark:text-red-400 font-medium">{overloaded?.pendingTasks} tasks</span></p>
                  </div>
                  <Badge variant="destructive" className="px-3 py-1">Will Relinquish</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">To (Lowest Pending / Free)</h4>
              <div className="p-4 rounded-xl border border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/20">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-green-100 dark:border-green-900">
                    <AvatarFallback className="bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 font-semibold">
                      {under?.name ? under.name.split(" ").map((n: string) => n[0]).join("") : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{under?.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Current Pending: <span className="text-blue-600 dark:text-blue-400 font-medium">{under?.pendingTasks} tasks</span></p>
                  </div>
                  <Badge className="bg-green-600 px-3 py-1">Will Receive</Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setRebalanceModal(false)} disabled={isRebalancing} className="rounded-xl border dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl shadow-md px-6 dark:shadow-none min-w-[140px]" disabled={isRebalancing} onClick={handleConfirmRebalance}>
              {isRebalancing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Rebalance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}