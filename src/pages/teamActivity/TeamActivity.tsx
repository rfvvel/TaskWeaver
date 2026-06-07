import { useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, Clock, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";

const API = "http://localhost:3000/api";

function ActivityDot({ type }: { type: string }) {
  const isStarted = type?.toLowerCase().includes("in-progress") || type?.toLowerCase().includes("start");
  const isCompleted = type?.toLowerCase().includes("completed") || type?.toLowerCase().includes("c");
  
  const bg = isCompleted ? "bg-green-100 dark:bg-green-950/50" : isStarted ? "bg-amber-100 dark:bg-amber-950/50" : "bg-indigo-100 dark:bg-indigo-950/50";
  const ic = isCompleted ? "text-green-600 dark:text-green-400" : isStarted ? "text-amber-500 dark:text-amber-400" : "text-indigo-500 dark:text-indigo-400";
  const Icon = isCompleted ? CheckCircle2 : Clock;
  
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-border ${bg}`}>
      <Icon className={`w-5 h-5 ${ic}`} />
    </div>
  );
}

export function TeamActivity() {
  const { activeTeam, teams } = useOutletContext<{ activeTeam: string; teams: any[] }>();
  const navigate = useNavigate();

  const currentTeam = teams?.find((t: any) => t.name === activeTeam);
  const groupId = currentTeam?.group_id || currentTeam?.id;

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [teamTasks, setTeamTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchActivityData = useCallback(async () => {
    if (!groupId) return;
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
      if (dataTeamTasks.status === "sukses") setTeamTasks(dataTeamTasks.data || []);

      const resActivity = await fetch(`${API}/getActivityByGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId }),
      });
      const dataActivity = await resActivity.json();
      if (dataActivity.status === "sukses") setActivities(dataActivity.data || []);

    } catch (err) {
      console.error("Gagal fetch activity data:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  const totalTasks = teamTasks.length;
  const completedTasks = teamTasks.filter(t => 
    (t.detail_task_status || t.DetailTaskStatus) === "completed" || 
    (t.detail_task_status || t.DetailTaskStatus) === "C"
  ).length;
  const remainingTasks = totalTasks - completedTasks;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const memberStats = members.map(m => {
    const memId = String(m.user_id || m.UserId);
    const mTasks = teamTasks.filter(t => String(t.user_id || t.UserId) === memId);
    const mTotal = mTasks.length;
    const mComplete = mTasks.filter(t => 
      (t.detail_task_status || t.DetailTaskStatus) === "completed" || 
      (t.detail_task_status || t.DetailTaskStatus) === "C"
    ).length;
    const mProgress = mTotal > 0 ? Math.round((mComplete / mTotal) * 100) : 0;

    return {
      id: memId,
      name: m.user_full_name || m.name || `User ${memId}`,
      totalTasks: mTotal,
      completedTasks: mComplete,
      progress: mProgress
    };
  });
  memberStats.sort((a, b) => b.progress - a.progress);

  if (!groupId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">No active team selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Please select or join a team first to view activity.</p>
        <Button onClick={() => navigate("/team-management")} className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white">
          <Users className="w-4 h-4 mr-2" /> Team Management
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Team Activity</h1>
        <p className="text-muted-foreground">Real-time updates and progress for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeTeam}</span></p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Overall Team Progress
          </CardTitle>
          <CardDescription>Current sprint completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Team Completion</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground font-medium mt-1">
              <span>{completedTasks} of {totalTasks} tasks completed</span>
              <span>{remainingTasks} tasks remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <Card className="lg:col-span-8 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live updates from your team members</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[295px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {activities.length > 0 ? activities.map((activity, idx) => (
                <div key={activity.log_id || idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <ActivityDot type={activity.action_type === 'I' || activity.action_description?.toLowerCase().includes('start') ? 'started' : 'completed'} />
                    {idx < activities.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2"></div>
                    )}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-950/50 hover:bg-accent transition-colors">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 border border-white dark:border-slate-800 shadow-sm">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-semibold text-sm">
                            {activity.user_full_name ? activity.user_full_name.substring(0, 2).toUpperCase() : "SI"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div>
                            <p className="text-sm">
                              <span className="font-semibold text-foreground">{activity.user_full_name || "Sistem"}</span>
                              {" "}
                              <span className="text-muted-foreground">{activity.action_description}</span>
                              {" "}
                              <span className="font-semibold text-foreground">"{activity.task_title || "Group File"}"</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                              {new Date(activity.audited_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No recent activity yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Member Progress</CardTitle>
            <CardDescription>Individual completion rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {memberStats.length > 0 ? memberStats.map((member, idx) => (
              <div key={member.id || idx} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border border-border shadow-sm">
                    <AvatarFallback className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold">
                      {member.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {member.completedTasks}/{member.totalTasks} tasks
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${
                    member.progress === 100 && member.totalTasks > 0 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400" :
                    member.progress > 0 ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400" :
                    "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400"
                  }`}>
                    {member.progress}%
                  </Badge>
                </div>
                <Progress value={member.progress} className="h-1.5" />
              </div>
            )) : (
              <p className="text-sm text-center text-muted-foreground py-4">No members found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}