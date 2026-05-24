import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

interface SubTask { id: string; title: string; assignedTo: string; avatarSeed: string; status: string; }
interface Task { id: string; team: string; title: string; difficulty: string; dueDate: string; assignedTo: string | null; status: string; subtasks: SubTask[]; }

export function Calendar() {
  const { activeTeam } = useOutletContext<{ activeTeam: string }>();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [baseDate, setBaseDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  useEffect(() => {
    const fetchTasks = () => {
      const stored = localStorage.getItem("tw_tasks");
      if (stored) setAllTasks(JSON.parse(stored));
    };
    fetchTasks();
    window.addEventListener("storage", fetchTasks);
    return () => window.removeEventListener("storage", fetchTasks);
  }, []);

  const teamTasks = allTasks.filter(t => t.team === activeTeam);

  const handlePrevWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() - 7);
    setBaseDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + 7);
    setBaseDate(newDate);
  };

  const goToToday = () => setBaseDate(new Date());

  const getWeekDays = (date: Date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    const week = [];
    const todayStr = new Date().toDateString();

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const dayTasks = teamTasks.filter(t => t.dueDate.startsWith(dateStr));

      week.push({
        date: nextDate.getDate(),
        day: nextDate.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: dateStr,
        isToday: nextDate.toDateString() === todayStr,
        tasks: dayTasks.map(t => ({
          id: t.id,
          title: t.title,
          time: "11:59 PM",
          member: t.assignedTo || "Unassigned",
          color: t.status === "completed" ? "bg-green-600 dark:bg-green-700" : "bg-indigo-600 dark:bg-indigo-700"
        }))
      });
    }
    return week;
  };

  const currentWeekDays = getWeekDays(baseDate);
  const currentMonthLabel = baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekStart = currentWeekDays[0].date;
  const weekEnd = currentWeekDays[6].date;
  const weekMonth = baseDate.toLocaleDateString("en-US", { month: "short" });

  const todayISO = new Date().toISOString().split('T')[0];
  const upcomingTasks = teamTasks
    .filter(t => t.status !== "completed" && t.dueDate >= todayISO)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-1">Calendar</h1>
          <p className="text-muted-foreground">Manage deadlines for <span className="font-semibold text-indigo-500 dark:text-indigo-400">{activeTeam}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday} className="rounded-xl mr-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950">
            Today
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-card border border-border rounded-xl min-w-[160px] text-center shadow-sm">
            <p className="font-medium text-foreground">{currentMonthLabel}</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>This Week</CardTitle>
                <CardDescription>{weekMonth} {weekStart} - {weekEnd}, {baseDate.getFullYear()}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 rounded-xl"
                onClick={() => setView(view === "week" ? "month" : "week")}
              >
                <CalendarIcon className="w-4 h-4" />
                {view === "week" ? "Month View" : "Week View"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {view === "week" ? (
              <div className="grid grid-cols-7 gap-2">
                {currentWeekDays.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border ${
                      day.isToday 
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/30 dark:to-cyan-950/30 ring-1 ring-indigo-200 dark:ring-indigo-800' 
                        : 'border-border bg-muted/40'
                    } hover:shadow-md transition-all min-h-[140px] flex flex-col`}
                  >
                    <div className="text-center mb-3">
                      <p className="text-xs text-muted-foreground font-medium mb-1">{day.day}</p>
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                        day.isToday 
                          ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                          : 'text-foreground font-semibold'
                      }`}>
                        {day.date}
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[120px] custom-scrollbar">
                      {day.tasks.map((task, i) => (
                        <div 
                          key={`${task.id}-${i}`} 
                          className={`${task.color} text-white px-2 py-1.5 rounded-md cursor-pointer hover:opacity-90 transition-opacity shadow-sm`}
                          title={`${task.title} - Assigned to ${task.member}`}
                        >
                          <p className="text-[11px] font-medium truncate leading-tight">{task.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-border rounded-xl">
                <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Pending tasks closest to deadline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length > 0 ? upcomingTasks.map((event) => (
              <div key={event.id} className="p-3 rounded-xl border border-border bg-muted/30 hover:border-indigo-500/50 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-foreground flex-1 leading-snug">{event.title}</h4>
                    <Badge 
                      variant="outline"
                      className={`text-[10px] ${
                        event.difficulty === "expert" || event.difficulty === "hard" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        event.difficulty === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-green-500/10 text-green-500 border-green-500/20"
                      }`}
                    >
                      {event.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span>{new Date(event.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar className="w-5 h-5 border border-background shadow-sm">
                      <AvatarFallback className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                        {(event.assignedTo || "Unassigned").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-medium text-muted-foreground">{event.assignedTo || "Unassigned"}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm font-medium text-foreground">Clear Schedule!</p>
                <p className="text-xs text-muted-foreground mt-1">No upcoming deadlines for {activeTeam}.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}