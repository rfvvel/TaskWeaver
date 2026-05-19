import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CheckCircle2, Circle, Clock, Flag, Search, Filter,
  Link as LinkIcon, UploadCloud, FileText, X, Inbox, Calendar as CalendarIcon,
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { format } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SubTask {
  id: string;
  title: string;
  assignedTo: string;
  avatarSeed: string;
  status: "todo" | "in-progress" | "completed";
}

interface Task {
  id: string;
  team: string;
  title: string;
  description: string;
  attachment: string | null;
  difficulty: "easy" | "medium" | "hard" | "expert";
  dueDate: string;
  assignedTo: string | null;
  tags: string[];
  status: "todo" | "in-progress" | "review" | "completed";
  subtasks: SubTask[];
}

interface MyTask {
  id: string;
  taskId: string;
  title: string;
  bigTaskTitle: string;
  team: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "completed";
  category: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TASKS_KEY = "tw_tasks";
const CURRENT_USER = "Rafael"; // Sesuaikan dengan nama user yang login nanti

// ─── Utilities ────────────────────────────────────────────────────────────────
function difficultyToPriority(d: string): MyTask["priority"] {
  if (d === "expert" || d === "hard") return "high";
  if (d === "medium") return "medium";
  return "low";
}

function loadAllTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw) as Task[];
  } catch (_) {}
  return [];
}

function saveAllTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function buildMyTasks(allTasks: Task[]): MyTask[] {
  const result: MyTask[] = [];
  allTasks.forEach((task) => {
    task.subtasks
      // Saat ini difilter berdasarkan CURRENT_USER. Bisa di-adjust nanti
      .forEach((sub) => {
        result.push({
          id: sub.id,
          taskId: task.id,
          title: sub.title,
          bigTaskTitle: task.title,
          team: task.team,
          deadline: task.dueDate,
          priority: difficultyToPriority(task.difficulty),
          status: sub.status,
          category: task.tags[0] ?? task.difficulty,
        });
      });
  });
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MyTasks() {
  const { activeTeam } = useOutletContext<{ activeTeam: string }>();

  const [allTasks, setAllTasksState] = useState<Task[]>(loadAllTasks);
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => {
      const fresh = loadAllTasks();
      setAllTasksState(fresh);
      setMyTasks(buildMyTasks(fresh).filter((t) => t.team === activeTeam));
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [activeTeam]);

  useEffect(() => {
    const onFocus = () => {
      const fresh = loadAllTasks();
      setAllTasksState(fresh);
      setMyTasks(buildMyTasks(fresh).filter((t) => t.team === activeTeam));
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [activeTeam]);

  const updateSubtaskStatus = (taskId: string, subtaskId: string, newStatus: SubTask["status"]) => {
    const updated = allTasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, status: newStatus } : s)),
      };
    });
    saveAllTasks(updated);
    setAllTasksState(updated);
    setMyTasks(buildMyTasks(updated).filter((mt) => mt.team === activeTeam));
  };

  // ── Submit dialog States ──────────────────────────────────────────────────
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submittingTask, setSubmittingTask] = useState<MyTask | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionFile, setSubmissionFile] = useState<string | null>(null);
  const [submissionFileSize, setSubmissionFileSize] = useState<string>("0 KB");
  // Default di-set ke Document agar rapi
  const [submissionCategory, setSubmissionCategory] = useState("document"); 
  const [activeTab, setActiveTab] = useState("link");

  const openSubmitDialog = (task: MyTask) => {
    setSubmittingTask(task);
    setSubmissionLink("");
    setSubmissionFile(null);
    setSubmissionCategory("document"); // Reset default
    setSubmitDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSubmissionFile(file.name);
      // Kalkulasi size
      if (file.size > 1024 * 1024) {
        setSubmissionFileSize((file.size / (1024 * 1024)).toFixed(1) + " MB");
      } else {
        setSubmissionFileSize((file.size / 1024).toFixed(0) + " KB");
      }
    }
  };

  const confirmSubmit = () => {
    if (!submittingTask) return;

    // --- INTEGRASI KE HALAMAN FILES ---
    const storedFiles = localStorage.getItem("tw_files");
    const currentFiles = storedFiles ? JSON.parse(storedFiles) : [];

    let fileName = "";
    let fileSize = "";
    let fileType = "document";

    if (activeTab === "link") {
      fileName = `Link: ${submittingTask.title}`;
      fileSize = "---";
      fileType = "document";
    } else {
      fileName = submissionFile || "unknown-file";
      fileSize = submissionFileSize;
      // Cek tipe file dari extension untuk icon di Files
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) fileType = 'image';
      else if (['fig', 'sketch'].includes(ext || '')) fileType = 'design';
      else if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].includes(ext || '')) fileType = 'code';
    }

    const newFile = {
      id: Date.now(),
      name: fileName,
      type: fileType, // type ini untuk nampilin warna icon di Files
      size: fileSize,
      owner: CURRENT_USER,
      avatar: CURRENT_USER,
      uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "final",
      category: submissionCategory // Kategori dari dropdown (design, document, code, other)
    };

    currentFiles.unshift(newFile); 
    localStorage.setItem("tw_files", JSON.stringify(currentFiles));
    
    window.dispatchEvent(new Event("storage"));
    // -----------------------------------

    updateSubtaskStatus(submittingTask.taskId, submittingTask.id, "completed");
    setSubmitDialogOpen(false);
    setSubmittingTask(null);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getPriorityColor = (p: string) => {
    const m: Record<string, string> = {
      high: "bg-red-50 text-red-700 border-red-200",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
      low: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return m[p] ?? "";
  };

  const getStatusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (s === "in-progress") return <Clock className="w-5 h-5 text-blue-600" />;
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  const filtered = (status?: string) => {
    let list = status ? myTasks.filter((t) => t.status === status) : myTasks;
    if (search.trim()) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total = myTasks.length;
  const inProgress = myTasks.filter((t) => t.status === "in-progress").length;
  const completed = myTasks.filter((t) => t.status === "completed").length;
  const highPriority = myTasks.filter((t) => t.priority === "high" && t.status !== "completed").length;

  const TaskCard = ({ task, showActions = true }: { task: MyTask; showActions?: boolean }) => (
    <Card className={`border-border bg-white shadow-sm hover:shadow-md transition-shadow ${task.status === "completed" ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {getStatusIcon(task.status)}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  From: <span className="font-medium text-indigo-600">{task.bigTaskTitle}</span> · {task.team}
                </p>
              </div>
              <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                {format(new Date(task.deadline), "MMM dd, yyyy")}
              </span>
              <Badge variant="secondary" className="text-xs bg-slate-100 capitalize">{task.category}</Badge>
            </div>

            {showActions && task.status !== "completed" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {task.status !== "in-progress" && (
                  <Button size="sm" variant="outline" onClick={() => updateSubtaskStatus(task.taskId, task.id, "in-progress")}>
                    Start
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => openSubmitDialog(task)}
                >
                  Complete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const NoTasksState = () => (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-indigo-400" />
      </div>
      <h3 className="font-semibold text-xl text-slate-900 mb-1">No tasks assigned yet</h3>
      <p className="text-sm text-slate-500 text-center max-w-xs">
        Sub-tasks assigned to you via <span className="font-medium text-indigo-600">AI Breakdown</span> in Task Management will appear here.
      </p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">My Tasks</h1>
        <p className="text-muted-foreground">
          Sub-tasks assigned to you in <span className="font-semibold text-blue-600">{activeTeam}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{total}</p>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">{inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">{completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-red-600">{highPriority}</p>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your tasks..."
            className="pl-10 rounded-xl bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {total === 0 ? (
        <NoTasksState />
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-slate-100/50 rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg">All ({total})</TabsTrigger>
            <TabsTrigger value="todo" className="rounded-lg">To Do ({myTasks.filter(t=>t.status==="todo").length})</TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-lg">In Progress ({inProgress})</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Completed ({completed})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filtered().length === 0 ? <p className="text-center text-slate-400 py-8">No tasks match your search.</p> : filtered().map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="todo" className="space-y-3">
            {filtered("todo").length === 0 ? <p className="text-center text-slate-400 py-8">No to-do tasks.</p> : filtered("todo").map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="in-progress" className="space-y-3">
            {filtered("in-progress").length === 0 ? <p className="text-center text-slate-400 py-8">No in-progress tasks.</p> : filtered("in-progress").map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-3">
            {filtered("completed").length === 0 ? <p className="text-center text-slate-400 py-8">No completed tasks yet.</p> : filtered("completed").map((t) => <TaskCard key={t.id} task={t} showActions={false} />)}
          </TabsContent>
        </Tabs>
      )}

      {/* Submit Work Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-2xl bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Your Work</DialogTitle>
            <DialogDescription>
              Attach a link or upload a file to mark <span className="font-semibold text-slate-700">"{submittingTask?.title}"</span> as completed.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="link" className="w-full mt-2" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl mb-4">
              <TabsTrigger value="link" className="rounded-lg">Link URL</TabsTrigger>
              <TabsTrigger value="file" className="rounded-lg">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Submission URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="e.g. https://github.com/..."
                    className="rounded-xl pl-9 bg-slate-50"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Document File</Label>
                {!submissionFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOCX, ZIP, PNG dll</p>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate block">{submissionFile}</span>
                        <span className="text-xs text-green-600 font-medium">Ready to submit ({submissionFileSize})</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSubmissionFile(null)} className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* DITAMBAHKAN: Dropdown Kategori (Sesuai Permintaan) */}
          <div className="space-y-2 mt-2">
            <Label className="text-sm font-semibold text-slate-700">Category</Label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={submissionCategory}
              onChange={(e) => setSubmissionCategory(e.target.value)}
            >
              <option value="design">Design</option>
              <option value="document">Document</option>
              <option value="code">Code</option>
              <option value="other">Other</option>
            </select>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={confirmSubmit}
              className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
              disabled={activeTab === "link" ? !submissionLink.trim() : !submissionFile}
            >
              Submit & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}