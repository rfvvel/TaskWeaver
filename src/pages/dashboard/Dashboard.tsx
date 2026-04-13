import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  Target,
  Calendar as CalendarIcon,
  Brain,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shuffle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";


const overviewStats = [
  {
    title: "Total Tasks",
    value: "24",
    change: "+3 this week",
    icon: Target,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "My Workload",
    value: "42%",
    change: "Balanced",
    icon: TrendingUp,
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    title: "Team Progress",
    value: "68%",
    change: "+12% this week",
    icon: Users,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "Deadlines",
    value: "3",
    change: "Next 7 days",
    icon: CalendarIcon,
    gradient: "from-orange-500 to-red-500"
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    role: "UI Designer",
    skills: ["UI Design", "Prototyping"],
    workload: 38,
    status: "balanced",
    tasks: 5
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    role: "Backend Dev",
    skills: ["Backend", "API Design"],
    workload: 52,
    status: "slightly-high",
    tasks: 7
  },
  {
    id: 3,
    name: "Emily Watson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    role: "Frontend Dev",
    skills: ["Frontend", "React"],
    workload: 45,
    status: "balanced",
    tasks: 6
  },
  {
    id: 4,
    name: "David Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    role: "Project Manager",
    skills: ["Proposal", "Documentation"],
    workload: 28,
    status: "under-utilized",
    tasks: 4
  },
  {
    id: 5,
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    role: "QA Engineer",
    skills: ["Testing", "Quality Assurance"],
    workload: 65,
    status: "overloaded",
    tasks: 8
  },
];

const upcomingDeadlines = [
  { task: "API Integration Testing", date: "Feb 16, 2026", priority: "high" },
  { task: "UI Mockups Finalization", date: "Feb 18, 2026", priority: "medium" },
  { task: "Database Schema Review", date: "Feb 20, 2026", priority: "high" },
];

export function Dashboard() {
  const [rebalanceModal, setRebalanceModal] = useState(false);
  const [distributionStatus, setDistributionStatus] = useState<"idle" | "running" | "complete">("idle");

  const handleRunDistribution = () => {
    setDistributionStatus("running");
    setTimeout(() => {
      setDistributionStatus("complete");
    }, 2000);
  };

  // --- Helper Functions ---

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
      case "balanced":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Balanced</Badge>;
      case "slightly-high":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Slightly High</Badge>;
      case "under-utilized":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Under-utilized</Badge>;
      case "overloaded":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overloaded</Badge>;
      default:
        return null;
    }
  };

  const hasOverloadedMembers = teamMembers.some(m => m.status === "overloaded");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">AI-powered team collaboration overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-border shadow-sm hover:shadow-md transition-shadow">
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
        
        <Card className="lg:col-span-2 border-border shadow-sm">
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
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 rounded-xl border border-border hover:border-indigo-200 hover:bg-accent/50 transition-all">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
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
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
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

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl border border-indigo-100">
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
                className="gap-2 rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Shuffle className="w-4 h-4" />
                Auto Rebalance
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.map((deadline, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border hover:bg-accent transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground mb-1">{deadline.task}</p>
                    <p className="text-xs text-muted-foreground">{deadline.date}</p>
                  </div>
                  <Badge
                    variant={deadline.priority === "high" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {deadline.priority}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full rounded-xl">
              View All Deadlines
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-indigo-900">AI Suggestion</p>
              <p className="text-sm text-indigo-700">
                Alex Johnson is overloaded. Consider moving 2 testing tasks to David Kim to balance the workload.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl">
              Apply Suggestion
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={rebalanceModal} onOpenChange={setRebalanceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-indigo-600" />
              Auto Rebalance Preview
            </DialogTitle>
            <DialogDescription>
              AI will redistribute tasks to balance workload across the team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Overloaded Members</h4>
              <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Alex Johnson</p>
                    <p className="text-sm text-muted-foreground">Current: 65% → Target: 45%</p>
                  </div>
                  <Badge variant="destructive">-3 tasks</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Will Receive Tasks</h4>
              <div className="space-y-2">
                <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=david" />
                      <AvatarFallback>DK</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">David Kim</p>
                      <p className="text-sm text-muted-foreground">Current: 28% → Target: 42%</p>
                    </div>
                    <Badge className="bg-green-600">+2 tasks</Badge>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Sarah Chen</p>
                      <p className="text-sm text-muted-foreground">Current: 38% → Target: 45%</p>
                    </div>
                    <Badge className="bg-green-600">+1 task</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setRebalanceModal(false)} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl"
                onClick={() => setRebalanceModal(false)}
              >
                Confirm Rebalance
              </Button>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}