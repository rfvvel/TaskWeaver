import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const currentWeek = [
  { date: 10, day: "Mon", tasks: [] },
  { date: 11, day: "Tue", tasks: [] },
  { date: 12, day: "Wed", tasks: [] },
  { 
    date: 13, 
    day: "Thu", 
    tasks: [
      { id: 1, title: "Design Review", time: "10:00 AM", member: "Sarah Chen", color: "bg-blue-500" },
      { id: 2, title: "Team Standup", time: "2:00 PM", member: "All", color: "bg-purple-500" },
    ]
  },
  { 
    date: 14, 
    day: "Fri", 
    isToday: true,
    tasks: [
      { id: 3, title: "API Testing", time: "11:00 AM", member: "Alex Johnson", color: "bg-green-500" },
      { id: 4, title: "Sprint Planning", time: "3:00 PM", member: "All", color: "bg-indigo-500" },
    ]
  },
  { 
    date: 15, 
    day: "Sat", 
    tasks: [] 
  },
  { 
    date: 16, 
    day: "Sun", 
    tasks: [
      { id: 5, title: "Auth Flow Due", time: "11:59 PM", member: "Sarah Chen", color: "bg-red-500", isDeadline: true },
    ]
  },
];

const upcomingEvents = [
  { 
    id: 1, 
    title: "Design authentication flow UI", 
    date: "Feb 16, 2026",
    time: "11:59 PM",
    type: "deadline",
    priority: "high",
    assignee: "Sarah Chen"
  },
  { 
    id: 2, 
    title: "API Integration Testing", 
    date: "Feb 16, 2026",
    time: "2:00 PM",
    type: "deadline",
    priority: "high",
    assignee: "Alex Johnson"
  },
  { 
    id: 3, 
    title: "UI Mockups Finalization", 
    date: "Feb 18, 2026",
    time: "5:00 PM",
    type: "deadline",
    priority: "medium",
    assignee: "Sarah Chen"
  },
  { 
    id: 4, 
    title: "Team Retrospective", 
    date: "Feb 19, 2026",
    time: "3:00 PM",
    type: "meeting",
    priority: "medium",
    assignee: "All"
  },
];

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState("February 2026");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-1">Calendar</h1>
          <p className="text-muted-foreground">Manage deadlines and team schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-card border border-border rounded-xl">
            <p className="font-medium">{currentMonth}</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Suggestion */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-indigo-900">AI Deadline Suggestion</p>
              <p className="text-sm text-indigo-700">
                Based on current progress, consider extending "UI Mockups Finalization" deadline by 2 days to Feb 20
              </p>
            </div>
            <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Calendar View */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>This Week</CardTitle>
                <CardDescription>Feb 10 - Feb 16, 2026</CardDescription>
              </div>
              <Button variant="outline" className="gap-2 rounded-xl">
                <CalendarIcon className="w-4 h-4" />
                Month View
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {currentWeek.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border ${
                    day.isToday 
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-cyan-50' 
                      : 'border-border bg-card'
                  } hover:shadow-md transition-all min-h-[140px] flex flex-col`}
                >
                  <div className="text-center mb-2">
                    <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                    <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center ${
                      day.isToday 
                        ? 'bg-gradient-to-br from-indigo-600 to-cyan-500 text-white font-semibold' 
                        : 'text-foreground'
                    }`}>
                      {day.date}
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    {day.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`${task.color} text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
                      >
                        <p className="font-medium truncate">{task.title}</p>
                        <p className="text-[10px] opacity-90">{task.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 rounded-xl border border-border hover:bg-accent transition-colors">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-foreground flex-1">{event.title}</h4>
                    <Badge 
                      variant={event.type === "deadline" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.assignee.toLowerCase().replace(' ', '')}`} />
                      <AvatarFallback className="text-[10px]">{event.assignee.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{event.assignee}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Task Distribution by Week</CardTitle>
          <CardDescription>Workload visualization for February 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { week: "Week 1 (Feb 1-7)", tasks: 8, progress: 100 },
              { week: "Week 2 (Feb 8-14)", tasks: 12, progress: 75 },
              { week: "Week 3 (Feb 15-21)", tasks: 10, progress: 30 },
              { week: "Week 4 (Feb 22-28)", tasks: 6, progress: 0 },
            ].map((week, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{week.week}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">{week.tasks} tasks</span>
                    <Badge variant="secondary" className="text-xs">
                      {week.progress}% complete
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${week.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
