import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

interface CalendarEvent {
  id: string;
  title: string;
  dueDate: string;
  assignedTo: string;
  status: string;
  userId: string | number; // ✅ Tambahan wadah untuk ID User
}

export function Calendar() {
  const { activeTeam, teams } = useOutletContext<{ activeTeam: string; teams: any[] }>();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [baseDate, setBaseDate] = useState(new Date());

  // ✅ 1. Ambil ID User yang sedang login (seperti di MyTasks)
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.UserID || currentUser?.user_id || currentUser?.id || null;

  const currentTeam = teams?.find((t: any) => t.name === activeTeam);
  const groupId = currentTeam?.group_id || currentTeam?.id;

  // 2. Fetch data Sub-task lalu saring berdasarkan User Login
  useEffect(() => {
    const fetchEvents = async () => {
      // Jika tidak ada tim yang dipilih atau user belum login, kosongkan kalender
      if (!groupId || !currentUserId) {
         setEvents([]);
         return;
      }
      try {
        const res = await fetch("http://localhost:3000/api/detailTaskGetByGroup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group_id: groupId })
        });
        const json = await res.json();
        
        if (json.status === "sukses") {
          const mapped = (json.data || [])
            .map((item: any) => ({
              id: item.detail_task_id || item.DetailTaskId,
              title: item.detail_task_name || item.DetailTaskName,
              dueDate: item.detail_task_deadline || item.DetailTaskDeadline,
              assignedTo: item.user_full_name || item.UserFullName || item.assigned_user_name || "Unassigned",
              status: item.detail_task_status || item.DetailTaskStatus || "todo",
              userId: item.user_id || item.UserId // Ambil ID pemilik tugas
            }))
            // ✅ FILTER SAKTI: Hanya sisakan tugas yang ID-nya cocok dengan currentUserId
            .filter((item: CalendarEvent) => String(item.userId) === String(currentUserId));
            
          setEvents(mapped);
        }
      } catch (e) {
        console.error("Gagal fetch data calendar:", e);
      }
    };
    fetchEvents();
  }, [groupId, activeTeam, currentUserId]);

  const handlePrevMonth = () => {
    const newDate = new Date(baseDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setBaseDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(baseDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setBaseDate(newDate);
  };

  const goToToday = () => setBaseDate(new Date());

  // 3. Logika untuk membuat Grid Kalender Bulan
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 
    
    const days = [];
    const todayStr = new Date().toDateString();

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      // ✅ Logika kebal timezone
      const dayTasks = events.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i;
      });

      days.push({
        date: i,
        fullDate: dateStr, 
        isToday: currentDate.toDateString() === todayStr,
        tasks: dayTasks.map(t => ({
          id: t.id,
          title: t.title,
          member: t.assignedTo,
          color: (t.status === "completed" || t.status === "C") ? "bg-green-600 dark:bg-green-700" : "bg-indigo-500 dark:bg-indigo-600"
        }))
      });
    }
    return days;
  };

  const currentMonthDays = getMonthDays(baseDate);
  const currentMonthLabel = baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 4. Logika Upcoming Deadlines (Max 7 Hari ke depan dari Hari Ini)
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingTasks = events
    .filter(t => {
      if (t.status === "completed" || t.status === "C") return false;
      if (!t.dueDate) return false;
      
      const d = new Date(t.dueDate);
      return d >= today && d <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5); 

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-1">Calendar</h1>
          <p className="text-muted-foreground">Manage your deadlines in <span className="font-semibold text-indigo-500 dark:text-indigo-400">{activeTeam}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday} className="rounded-xl mr-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950">
            Today
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-card border border-border rounded-xl min-w-[160px] text-center shadow-sm">
            <p className="font-medium text-foreground">{currentMonthLabel}</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>{currentMonthLabel} Schedule</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-xs font-bold text-muted-foreground uppercase">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {currentMonthDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="p-3 rounded-xl border border-transparent min-h-[100px]" />;
                
                return (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-xl border ${
                      day.isToday 
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/30 dark:to-cyan-950/30 ring-1 ring-indigo-200 dark:ring-indigo-800' 
                        : 'border-border bg-muted/20'
                    } hover:shadow-md transition-all min-h-[100px] flex flex-col`}
                  >
                    <div className="text-center mb-1.5">
                      <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${
                        day.isToday 
                          ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                          : 'text-foreground font-medium'
                      }`}>
                        {day.date}
                      </div>
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[70px] custom-scrollbar">
                      {day.tasks.map((task, i) => (
                        <div 
                          key={`${task.id}-${i}`} 
                          className={`${task.color} text-white px-1.5 py-1 rounded cursor-pointer hover:opacity-90 transition-opacity shadow-sm`}
                          title={`${task.title}`}
                        >
                          <p className="text-[10px] font-medium truncate leading-tight">{task.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Upcoming Deadlines */}
        <Card className="border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Your tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length > 0 ? upcomingTasks.map((event) => (
              <div key={event.id} className="p-3 rounded-xl border border-border bg-muted/30 hover:border-indigo-500/50 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-foreground flex-1 leading-snug">{event.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span>{new Date(event.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar className="w-5 h-5 border border-background shadow-sm">
                      <AvatarFallback className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                        {(event.assignedTo || "U").charAt(0).toUpperCase()}
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
                <p className="text-xs text-muted-foreground mt-1">You have no upcoming deadlines in 7 days.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}