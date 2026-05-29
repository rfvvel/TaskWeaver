import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CheckCircle2, Circle, Clock, Flag, Search, Inbox, UploadCloud, FileText, X, Link as LinkIcon
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { format } from "date-fns";

const API = "http://localhost:3000/api";

// ─── Types ───────────────────────────────────────────────────
interface MyTask {
  id: number;
  taskId: number;
  title: string;
  bigTaskTitle: string;
  team: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "completed";
  category: string;
}

// ✅ Fungsi aman untuk format tanggal
function safeFormat(dateStr: any, fmt: string) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Invalid date" : format(d, fmt);
}

export function MyTasks() {
  const { activeTeam } = useOutletContext<{ activeTeam: string }>();

  // Ambil ID User yang sedang login
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.UserID || currentUser?.user_id || currentUser?.id || null;

  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ─── Fetch Tasks dari Backend ───
  const fetchMyTasks = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/detailTaskGetByUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId }),
      });
      const json = await res.json();
      if (json.status === "sukses") {
        // Normalisasi data dari database agar cocok dengan UI React
        const formattedTasks: MyTask[] = (json.data || []).map((t: any) => ({
          id: t.DetailTaskId || t.detail_task_id,
          taskId: t.TaskId || t.task_id,
          title: t.DetailTaskName || t.detail_task_name,
          bigTaskTitle: `Task #${t.TaskId || t.task_id}`, // Fallback nama task besar
          team: activeTeam || "Your Team",
          deadline: t.DetailTaskDeadline || t.detail_task_deadline,
          priority: "medium", // Default priority
          status: t.DetailTaskStatus || t.detail_task_status || "todo",
          category: "task",
        }));
        setMyTasks(formattedTasks);
      }
    } catch (err) {
      console.error("Gagal fetch my tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, activeTeam]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  // ─── Update Status ke Backend ───
  const updateTaskStatus = async (detailTaskId: number, newStatus: string) => {
    try {
      // Update UI langsung biar terasa cepat (Optimistic UI Update)
      setMyTasks(prev => prev.map(t => t.id === detailTaskId ? { ...t, status: newStatus as any } : t));
      
      await fetch(`${API}/detailTaskUpdateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detail_task_id: detailTaskId, new_status: newStatus }),
      });
      // Panggil fetch lagi untuk memastikan sinkron dengan DB
      fetchMyTasks();
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  // ─── State Modal Submit (Tetap Sama Seperti Gayamu) ───
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submittingTask, setSubmittingTask] = useState<MyTask | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionFile, setSubmissionFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("link");

  const openSubmitDialog = (task: MyTask) => {
    setSubmittingTask(task);
    setSubmissionLink("");
    setSubmissionFile(null);
    setSubmitDialogOpen(true);
  };

  const confirmSubmit = () => {
    if (!submittingTask) return;
    
    // Nanti logika simpan file/link bisa diarahkan ke backend
    // Untuk sekarang, kita langsung update status task jadi completed
    updateTaskStatus(submittingTask.id, "completed");
    setSubmitDialogOpen(false);
    setSubmittingTask(null);
  };

  const getPriorityColor = (p: string) => {
    const m: Record<string, string> = {
      high: "bg-red-500/10 text-red-500 border-red-500/20",
      medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return m[p] ?? "";
  };

  const getStatusIcon = (s: string) => {
    if (s === "completed" || s === "C") return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
    if (s === "in-progress") return <Clock className="w-5 h-5 text-blue-500 shrink-0" />;
    return <Circle className="w-5 h-5 text-muted-foreground shrink-0" />;
  };

  const filtered = (status?: string) => {
    let list = status 
      ? myTasks.filter((t) => (status === "completed" ? (t.status === "completed" || t.status === "C") : t.status === status)) 
      : myTasks;
    if (search.trim()) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  };

  const total = myTasks.length;
  const inProgress = myTasks.filter((t) => t.status === "in-progress").length;
  const completed = myTasks.filter((t) => t.status === "completed" || t.status === "C").length;

  const TaskCard = ({ task, showActions = true }: { task: MyTask; showActions?: boolean }) => (
    <Card className={`border-border bg-card shadow-sm hover:shadow-md transition-shadow ${(task.status === "completed" || task.status === "C") ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {getStatusIcon(task.status)}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`font-medium ${(task.status === "completed" || task.status === "C") ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  From: <span className="font-medium text-indigo-500 dark:text-indigo-400">{task.bigTaskTitle}</span> · {task.team}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                {safeFormat(task.deadline, "MMM dd, yyyy")}
              </span>
            </div>

            {showActions && task.status !== "completed" && task.status !== "C" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {task.status !== "in-progress" && (
                  <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "in-progress")}>
                    Start
                  </Button>
                )}
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openSubmitDialog(task)}>
                  Complete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">My Tasks</h1>
        <p className="text-muted-foreground">
          Sub-tasks assigned to you in <span className="font-semibold text-blue-500">{activeTeam}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your tasks..."
            className="pl-10 rounded-xl bg-card text-foreground border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><p>Loading your tasks...</p></div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-2xl bg-card">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="font-semibold text-xl text-foreground mb-1">No tasks assigned yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Sub-tasks assigned to you via <span className="font-medium text-indigo-500">AI Breakdown</span> will appear here.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-muted rounded-xl p-1 border border-border">
            <TabsTrigger value="all" className="rounded-lg">All ({total})</TabsTrigger>
            <TabsTrigger value="todo" className="rounded-lg">To Do ({myTasks.filter(t=>t.status==="todo").length})</TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-lg">In Progress ({inProgress})</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Completed ({completed})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filtered().length === 0 ? <p className="text-center text-muted-foreground py-8">No tasks found.</p> : filtered().map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="todo" className="space-y-3">
            {filtered("todo").map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="in-progress" className="space-y-3">
            {filtered("in-progress").map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-3">
            {filtered("completed").map((t) => <TaskCard key={t.id} task={t} showActions={false} />)}
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog Submit Work */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-2xl bg-card border border-border sm:max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle>Submit Your Work</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Attach a link or upload a file to mark <span className="font-semibold text-foreground">"{submittingTask?.title}"</span> as completed.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="link" className="w-full mt-2" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl mb-4 border border-border">
              <TabsTrigger value="link">Link URL</TabsTrigger>
              <TabsTrigger value="file">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="link" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Submission URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. https://github.com/..."
                    className="rounded-xl pl-9 bg-background border-border text-foreground"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="file" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Document File</Label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-xl cursor-pointer hover:bg-muted transition-colors">
                  <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground"><span className="font-semibold text-indigo-500">Click to upload</span></p>
                </label>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={confirmSubmit} className="rounded-xl bg-green-600 hover:bg-green-700 text-white">
              Submit & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}