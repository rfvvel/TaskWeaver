import { Activity, CheckCircle2, Upload, MessageSquare, UserPlus, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";

const activities = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    action: "completed task",
    target: "Design authentication flow mockups",
    time: "2 hours ago",
    type: "completed",
    progress: 15
  },
  {
    id: 2,
    user: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    action: "uploaded file",
    target: "test-results-final.pdf",
    time: "3 hours ago",
    type: "upload"
  },
  {
    id: 3,
    user: "Michael Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    action: "commented on",
    target: "API Integration Testing",
    time: "5 hours ago",
    type: "comment",
    comment: "The endpoint is working perfectly now!"
  },
  {
    id: 4,
    user: "Emily Watson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    action: "started working on",
    target: "User profile components",
    time: "6 hours ago",
    type: "started",
    progress: 35
  },
  {
    id: 5,
    user: "David Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    action: "updated",
    target: "Project proposal document",
    time: "1 day ago",
    type: "update",
    progress: 80
  },
  {
    id: 6,
    user: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    action: "completed task",
    target: "Create wireframes for dashboard",
    time: "1 day ago",
    type: "completed",
    progress: 22
  },
  {
    id: 7,
    user: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    action: "completed task",
    target: "Set up testing environment",
    time: "2 days ago",
    type: "completed",
    progress: 8
  },
];

const teamProgress = [
  { name: "Sarah Chen", avatar: "sarah", tasksCompleted: 12, tasksTotal: 18, progress: 67 },
  { name: "Michael Rodriguez", avatar: "michael", tasksCompleted: 8, tasksTotal: 15, progress: 53 },
  { name: "Emily Watson", avatar: "emily", tasksCompleted: 10, tasksTotal: 14, progress: 71 },
  { name: "David Kim", avatar: "david", tasksCompleted: 6, tasksTotal: 12, progress: 50 },
  { name: "Alex Johnson", avatar: "alex", tasksCompleted: 9, tasksTotal: 16, progress: 56 },
];

export function TeamActivity() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "upload":
        return <Upload className="w-5 h-5 text-blue-600" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case "started":
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Team Activity</h1>
        <p className="text-muted-foreground">Real-time updates and team progress tracking</p>
      </div>

      {/* Overall Team Progress */}
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
              <span className="text-sm text-muted-foreground">Team Completion</span>
              <span className="text-2xl font-semibold text-indigo-600">68%</span>
            </div>
            <Progress value={68} className="h-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>45 of 75 tasks completed</span>
              <span>30 tasks remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live updates from your team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div key={activity.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 border border-border">
                      {getActivityIcon(activity.type)}
                    </div>
                    {idx < activities.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2"></div>
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-6">
                    <div className="p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={activity.avatar} />
                          <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-sm">
                              <span className="font-medium text-foreground">{activity.user}</span>
                              {" "}
                              <span className="text-muted-foreground">{activity.action}</span>
                              {" "}
                              <span className="font-medium text-foreground">"{activity.target}"</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                          
                          {activity.comment && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm text-foreground italic">"{activity.comment}"</p>
                            </div>
                          )}

                          {activity.progress !== undefined && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Contributed to team progress</span>
                                <span className="font-medium text-indigo-600">+{activity.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full"
                                  style={{ width: `${activity.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Member Progress */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Member Progress</CardTitle>
            <CardDescription>Individual completion rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamProgress.map((member, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.tasksCompleted}/{member.tasksTotal} tasks
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {member.progress}%
                  </Badge>
                </div>
                <Progress value={member.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">45</p>
                <p className="text-xs text-muted-foreground">Completed Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">23</p>
                <p className="text-xs text-muted-foreground">Files Uploaded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">156</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">187h</p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
