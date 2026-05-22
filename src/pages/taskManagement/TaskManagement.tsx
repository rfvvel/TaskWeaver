import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Calendar as CalendarIcon, ListChecks, 
  Users, Sparkles, Loader2, UploadCloud, FileText, X, Paperclip 
} from "lucide-react"; 
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { format } from "date-fns";

export interface SubTask { id: string; title: string; assignedTo: string; avatarSeed: string; status: "todo" | "in-progress" | "completed"; }
export interface Task { id: string; team: string; title: string; description: string; attachment: string | null; difficulty: "easy" | "medium" | "hard" | "expert"; dueDate: string; assignedTo: string | null; tags: string[]; status: "todo" | "in-progress" | "review" | "completed"; subtasks: SubTask[]; }

const TASKS_KEY = "tw_tasks";

const SEED_TASKS: Task[] = [
  {
    id: "seed-1",
    team: "CS Project Team",
    title: "Membuat Video Iklan Campaign",
    description: "Produksi video iklan berdurasi 30 detik untuk peluncuran fitur baru di Instagram dan TikTok.",
    attachment: null,
    difficulty: "hard",
    dueDate: new Date("2026-05-20").toISOString(),
    assignedTo: "Tim Kreatif",
    tags: ["marketing", "video", "campaign"],
    status: "in-progress",
    subtasks: [
      { id: "1a", title: "Konsep & Planner Iklan", assignedTo: "Evan Varian", avatarSeed: "evan", status: "completed" },
      { id: "1b", title: "Video Taking / Shooting", assignedTo: "Steven Nathaniel", avatarSeed: "steven", status: "in-progress" },
      { id: "1c", title: "Video Editing & Render", assignedTo: "Lie Darren", avatarSeed: "darren", status: "todo" },
    ],
  },
  {
    id: "seed-2",
    team: "CS Project Team",
    title: "Presentasi Matematika SMP",
    description: "Menyiapkan materi dan presentasi untuk acara edukasi anak SMP binaan CSR.",
    attachment: "Panduan_Acara_CSR.pdf",
    difficulty: "medium",
    dueDate: new Date("2026-05-25").toISOString(),
    assignedTo: null,
    tags: ["education", "presentation"],
    status: "todo",
    subtasks: [],
  },
];

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw) as Task[];
  } catch (_) {}
  localStorage.setItem(TASKS_KEY, JSON.stringify(SEED_TASKS));
  return SEED_TASKS;
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function TaskManagement() {
  const { activeTeam } = useOutletContext<{ activeTeam: string }>();
  const [tasks, setTasksState] = useState<Task[]>(loadTasks);

  const setTasks = (updated: Task[]) => {
    setTasksState(updated);
    saveTasks(updated);
  };

  const currentTeamTasks = tasks.filter((t) => t.team === activeTeam);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const emptyForm: Partial<Task> = {
    title: "", description: "", attachment: null,
    difficulty: "medium", dueDate: new Date().toISOString(), tags: [], status: "todo", subtasks: [],
  };
  const [formData, setFormData] = useState<Partial<Task>>(emptyForm);

  useEffect(() => {
    if (selectedTask) {
      const fresh = tasks.find((t) => t.id === selectedTask.id);
      if (fresh) setSelectedTask(fresh);
    }
  }, [tasks]);

  const handleCreateTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      team: activeTeam,
      title: formData.title || "",
      description: formData.description || "",
      attachment: formData.attachment || null,
      difficulty: formData.difficulty || "medium",
      dueDate: formData.dueDate || new Date().toISOString(),
      assignedTo: null,
      tags: formData.tags || [],
      status: "todo",
      subtasks: [],
    };
    setTasks([...tasks, newTask]);
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...formData } : t)));
    setEditingTask(null);
    setDialogOpen(false);
    resetForm();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const resetForm = () => setFormData(emptyForm);

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData(task);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    resetForm();
    setDialogOpen(true);
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, attachment: e.target.files[0].name });
    }
  };

  const removeAttachment = () => setFormData({ ...formData, attachment: null });

  const getDifficultyColor = (d: string) => {
    const map: Record<string, string> = { expert: "bg-purple-600", hard: "bg-red-600", medium: "bg-blue-600", easy: "bg-green-600" };
    return map[d] ?? "bg-gray-600";
  };

  const handleRunAI = () => {
    if (!selectedTask) return;
    setIsGeneratingAI(true);

    setTimeout(() => {
      const now = Date.now();
      const aiSubtasks: SubTask[] = [
        { id: `${now}a`, title: "Riset dan Kumpulkan Materi", assignedTo: "Evan Varian", avatarSeed: "evan", status: "todo" },
        { id: `${now}b`, title: "Desain & Susun Presentasi", assignedTo: "Lie Darren", avatarSeed: "darren", status: "todo" },
        { id: `${now}c`, title: "Review & Finalisasi", assignedTo: "Steven Nathaniel", avatarSeed: "steven", status: "todo" },
      ];

      const updatedTask = { ...selectedTask, subtasks: aiSubtasks };
      const updatedTasks = tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t));

      setTasks(updatedTasks);
      setSelectedTask(updatedTask);
      setIsGeneratingAI(false);
    }, 2500);
  };

  const toggleSubtaskStatus = (subtaskId: string) => {
    if (!selectedTask) return;
    const updatedSubtasks = selectedTask.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, status: s.status === "completed" ? ("todo" as const) : ("completed" as const) } : s
    );
    const updatedTask = { ...selectedTask, subtasks: updatedSubtasks };
    const updatedTasks = tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t));
    setTasks(updatedTasks);
    setSelectedTask(updatedTask);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage tasks for <span className="font-semibold text-blue-600 dark:text-blue-400">{activeTeam}</span>
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 shadow-md text-white px-6 dark:shadow-none"
          onClick={openCreateDialog}
        >
          <Plus className="w-4 h-4" /> Create Task
        </Button>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-50">{editingTask ? "Edit Task" : `Create Task for ${activeTeam}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" placeholder="e.g. Develop Mobile App UI" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="rounded-xl dark:bg-slate-950 dark:border-slate-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the overall goal of this task..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-xl min-h-[100px] dark:bg-slate-950 dark:border-slate-800" />
            </div>
            <div className="space-y-2">
              <Label>Reference Material (PDF/Docs)</Label>
              {!formData.attachment ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF, DOCX, or Images (Max 10MB)</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.png,.jpg" />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                    <div><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formData.attachment}</span><br /><span className="text-xs text-slate-400 dark:text-slate-500">Ready to upload</span></div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeAttachment} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Overall Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v as Task["difficulty"] })}>
                  <SelectTrigger className="rounded-xl bg-white dark:bg-slate-950 dark:border-slate-800"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-50">
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Final Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl bg-white dark:bg-slate-950 dark:border-slate-800">
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : <span className="text-slate-400">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl bg-white dark:bg-slate-950 border dark:border-slate-800">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                      onSelect={(date) => setFormData({ ...formData, dueDate: date ? date.toISOString() : new Date().toISOString() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" placeholder="e.g., frontend, design, urgent" value={formData.tags?.join(", ")} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className="rounded-xl dark:bg-slate-950 dark:border-slate-800" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="rounded-xl border dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button onClick={editingTask ? handleUpdateTask : handleCreateTask} className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white">
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details + AI Breakdown Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="rounded-2xl max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border dark:border-slate-800 transition-all">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getDifficultyColor(selectedTask.difficulty)} text-white border-none px-3 py-1`}>{selectedTask.difficulty}</Badge>
                </div>
                <DialogTitle className="text-2xl text-slate-900 dark:text-slate-50">{selectedTask.title}</DialogTitle>
                <DialogDescription className="text-base mt-2 text-slate-700 dark:text-slate-300">{selectedTask.description}</DialogDescription>
                {selectedTask.attachment && (
                  <div className="mt-4 p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center gap-3 w-fit pr-8">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                    <div className="flex flex-col flex-1">
                      <span className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider">Reference File</span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{selectedTask.attachment}</span>
                    </div>
                  </div>
                )}
              </DialogHeader>

              <div className="py-4 space-y-4 border-t dark:border-slate-800 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-50">
                    <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Sub-tasks Breakdown
                  </h3>
                  <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">{selectedTask.subtasks.length} tasks</Badge>
                </div>

                <div className="grid gap-3 min-h-[150px]">
                  {isGeneratingAI && (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                      <p className="text-slate-700 dark:text-slate-300 font-medium">AI is analyzing the task...</p>
                      <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">Breaking down and assigning to team members based on skill.</p>
                    </div>
                  )}

                  {!isGeneratingAI && selectedTask.subtasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">No sub-tasks yet.</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-5 text-center max-w-sm">
                        Let AI read the description and <span className="font-semibold text-slate-700 dark:text-slate-300">reference file</span>, then auto-assign sub-tasks to the team.
                      </p>
                      <Button onClick={handleRunAI} className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-md px-6 dark:shadow-none">
                        <Sparkles className="w-4 h-4 mr-2" /> Breakdown with AI
                      </Button>
                    </div>
                  )}

                  {!isGeneratingAI && selectedTask.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      onClick={() => toggleSubtaskStatus(sub.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${sub.status === "completed" ? "bg-green-500 border-green-500" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"}`}>
                          {sub.status === "completed" && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className={`font-medium ${sub.status === "completed" ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-900 dark:text-slate-100"}`}>{sub.title}</span>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Click to toggle status</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-800">
                          <AvatarFallback className="bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {sub.assignedTo.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-28 truncate">{sub.assignedTo}</span>
                        <Badge variant="outline" className={`text-[10px] ${
                          sub.status === "completed" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50" :
                          sub.status === "in-progress" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50" :
                          "bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                        }`}>
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Task List */}
      <div className="grid gap-4">
        {currentTeamTasks.map((task) => (
          <Card
            key={task.id}
            onClick={() => openTaskDetails(task)}
            className="rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h3>
                        {task.attachment && <Paperclip className="w-4 h-4 text-slate-400" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getDifficultyColor(task.difficulty)} text-white rounded-md border-none px-3`}>{task.difficulty}</Badge>
                    <Badge variant="outline" className="rounded-md gap-1 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      {format(new Date(task.dueDate), "MMM dd")}
                    </Badge>
                    <Badge variant="outline" className="rounded-md gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50">
                      <Users className="w-3 h-3" />{task.subtasks.length} Sub-tasks
                    </Badge>
                    {task.subtasks.length > 0 && (
                      <Badge variant="outline" className="rounded-md gap-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50">
                        {task.subtasks.filter((s) => s.status === "completed").length}/{task.subtasks.length} done
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(task)} className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border dark:border-slate-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-slate-400">This will permanently delete "{task.title}" and all its sub-tasks.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl dark:border-slate-800 dark:hover:bg-slate-800">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-none">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {currentTeamTasks.length === 0 && (
        <Card className="rounded-2xl border-dashed border-2 bg-transparent border-slate-200 dark:border-slate-800 shadow-none mt-8">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <h3 className="font-semibold text-xl mb-1 text-slate-900 dark:text-slate-50">No Tasks Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create the first task for <span className="font-semibold text-slate-700 dark:text-slate-300">{activeTeam}</span>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}