import React, { useState } from "react";
import { useOutletContext } from "react-router-dom"; // <-- TAMBAHAN UNTUK SINKRONISASI
import {
  TrendingUp, Users, Target, Calendar as CalendarIcon,
  Brain, AlertCircle, CheckCircle2, Clock, Shuffle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

// Interface untuk menangkap data dari Layout
interface TeamMember { id: string; name: string; email: string; role: string; avatarSeed: string; joinDate: string; }
interface Team { id: string; name: string; description: string; members: TeamMember[]; }

export function Dashboard() {
  // 1. TANGKAP DATA TIM DARI LAYOUT
  const { activeTeam, teams } = useOutletContext<{ activeTeam: string, teams: Team[] }>();
  
  // 2. CARI DATA TIM YANG SEDANG AKTIF
  const currentTeamData = teams.find(t => t.name === activeTeam) || teams[0];

  const [rebalanceModal, setRebalanceModal] = useState(false);
  const [distributionStatus, setDistributionStatus] = useState<"idle" | "running" | "complete">("idle");

  const handleRunDistribution = () => {
    setDistributionStatus("running");
    setTimeout(() => {
      setDistributionStatus("complete");
    }, 2000);
  };

  // 3. GENERATE MOCK WORKLOAD BERDASARKAN MEMBER ASLI DI TIM INI
  // (Karena kita belum punya database tugas asli per member, kita buat simulasi yang meyakinkan)
  const teamMembersWithWorkload = currentTeamData?.members.map((member, index) => {
    const workloads = [38, 65, 28, 52, 45, 70, 20]; // Pola persentase acak
    const workload = workloads[index % workloads.length];
    
    let status = "balanced";
    if (workload < 35) status = "under-utilized";
    else if (workload > 60) status = "overloaded";
    else if (workload > 50) status = "slightly-high";

    return {
      ...member,
      skills: member.role === "admin" ? ["Management", "Review"] : ["Execution", "Design"],
      workload,
      status,
      tasks: Math.floor(workload / 10)
    };
  }) || [];

  // 4. CARI KORBAN AUTO-REBALANCE SECARA DINAMIS
  const overloadedMember = teamMembersWithWorkload.find(m => m.status === "overloaded") || teamMembersWithWorkload[0];
  const underUtilizedMember = teamMembersWithWorkload.find(m => m.status === "under-utilized") || teamMembersWithWorkload[teamMembersWithWorkload.length - 1];
  const hasOverloadedMembers = teamMembersWithWorkload.some(m => m.status === "overloaded");

  const getWorkloadColor = (workload: number) => {
    if (workload < 35) return "text-blue-600";
    if (workload < 50) return "text-green-600";
    if (workload < 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getWorkloadBarColor = (workload: number) => {
    if (workload < 35) return "bg-blue-500";
    if (workload < 50) return "bg-green-500";
    if (workload < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "balanced": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Balanced</Badge>;
      case "slightly-high": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Slightly High</Badge>;
      case "under-utilized": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Under-utilized</Badge>;
      case "overloaded": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overloaded</Badge>;
      default: return null;
    }
  };

  // Stat dummy yang disesuaikan sedikit
  const overviewStats = [
    { title: "Total Team Tasks", value: "24", change: "+3 this week", icon: Target, gradient: "from-blue-500 to-cyan-500" },
    { title: "My Workload", value: "42%", change: "Balanced", icon: TrendingUp, gradient: "from-blue-500 to-cyan-500" },
    { title: "Team Progress", value: "68%", change: "+12% this week", icon: Users, gradient: "from-blue-500 to-cyan-500" },
    { title: "Deadlines", value: "3", change: "Next 7 days", icon: CalendarIcon, gradient: "from-blue-500 to-cyan-500" },
  ];

  const upcomingDeadlines = [
    { task: "API Integration Testing", date: "Feb 16, 2026", priority: "high" },
    { task: "UI Mockups Finalization", date: "Feb 18, 2026", priority: "medium" },
    { task: "Database Schema Review", date: "Feb 20, 2026", priority: "high" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Dashboard</h1>
        {/* Teks Sub-header berubah sesuai tim aktif */}
        <p className="text-muted-foreground">AI-powered collaboration overview for <span className="font-semibold text-blue-600">{activeTeam}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-border bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card className="lg:col-span-2 border-border bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  AI Task Distribution
                </CardTitle>
                <CardDescription>Intelligent workload balancing across team members</CardDescription>
              </div>
              <Button
                onClick={handleRunDistribution}
                disabled={distributionStatus === "running"}
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl shadow-md"
              >
                {distributionStatus === "running" && (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {distributionStatus === "idle" && "Run AI Distribution"}
                {distributionStatus === "running" && "Analyzing..."}
                {distributionStatus === "complete" && "Distribution Complete"}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {teamMembersWithWorkload.map((member) => (
              <div key={member.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-slate-100 transition-all">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border border-slate-200">
                    <AvatarFallback className="bg-white">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-semibold ${getWorkloadColor(member.workload)}`}>
                          {member.workload}%
                        </p>
                        <p className="text-xs text-muted-foreground">{member.tasks} tasks</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {member.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Workload</span>
                        {getStatusBadge(member.status)}
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${getWorkloadBarColor(member.workload)} transition-all duration-500 rounded-full`}
                          style={{ width: `${member.workload}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl border border-indigo-100 mt-6">
              <div className="flex items-center gap-2">
                {hasOverloadedMembers ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Needs Rebalance</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Team Workload Balanced</span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setRebalanceModal(true)}
                className="gap-2 rounded-xl border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50"
              >
                <Shuffle className="w-4 h-4" />
                Auto Rebalance
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-600 to-cyan-600 shadow-md text-white">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">AI Insight</p>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    {/* Teks AI yang sepenuhnya dinamis membaca nama tim dan anggotanya */}
                    <span className="font-semibold text-white">{overloadedMember?.name}</span> is currently overloaded. Consider moving some tasks to <span className="font-semibold text-white">{underUtilizedMember?.name}</span> to balance the workload for {activeTeam}.
                  </p>
                </div>
                <Button className="bg-white text-indigo-600 hover:bg-slate-100 rounded-xl w-full mt-2 font-semibold shadow-sm">
                  Apply Suggestion
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.map((deadline, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground mb-1">{deadline.task}</p>
                      <p className="text-xs text-muted-foreground">{deadline.date}</p>
                    </div>
                    <Badge variant={deadline.priority === "high" ? "destructive" : "secondary"} className="text-[10px] uppercase">
                      {deadline.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-xl mt-2">
                View All Deadlines
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={rebalanceModal} onOpenChange={setRebalanceModal}>
        <DialogContent className="max-w-xl bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shuffle className="w-5 h-5 text-indigo-600" />
              Auto Rebalance Preview
            </DialogTitle>
            <DialogDescription>
              AI will redistribute tasks to balance workload across the team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4 border-t border-slate-100 mt-2">
            
            {/* KORBAN OVERLOAD DINAMIS */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700">Overloaded Member</h4>
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-red-100">
                    <AvatarFallback className="bg-white text-red-600">{overloadedMember?.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{overloadedMember?.name}</p>
                    <p className="text-sm text-slate-500">Current: <span className="text-red-600 font-medium">{overloadedMember?.workload}%</span> → Target: <span className="text-green-600 font-medium">45%</span></p>
                  </div>
                  <Badge variant="destructive" className="px-3 py-1 shadow-sm">-2 tasks</Badge>
                </div>
              </div>
            </div>

            {/* PENERIMA TASK DINAMIS */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700">Will Receive Tasks</h4>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-green-200 bg-green-50/50">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border border-green-100">
                      <AvatarFallback className="bg-white text-green-600">{underUtilizedMember?.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{underUtilizedMember?.name}</p>
                      <p className="text-sm text-slate-500">Current: <span className="text-blue-600 font-medium">{underUtilizedMember?.workload}%</span> → Target: <span className="text-green-600 font-medium">42%</span></p>
                    </div>
                    <Badge className="bg-green-600 px-3 py-1 shadow-sm">+2 tasks</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setRebalanceModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl shadow-md px-6"
              onClick={() => setRebalanceModal(false)}
            >
              Confirm Rebalance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}