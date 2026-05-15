import { useState } from "react";
import { useOutletContext } from "react-router-dom"; // navigate dihapus karena tidak butuh pindah halaman lagi
import { Plus, Edit, Trash2, Calendar as CalendarIcon, ListChecks, Users, Sparkles, Loader2 } from "lucide-react"; 
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { format } from "date-fns";

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
  difficulty: "easy" | "medium" | "hard" | "expert";
  dueDate: Date;
  assignedTo: string | null;
  tags: string[];
  status: "todo" | "in-progress" | "review" | "completed";
  subtasks: SubTask[]; 
}

export function TaskManagement() {
  const { activeTeam } = useOutletContext<{ activeTeam: string }>();

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      team: "Marketing Campaign",
      title: "Membuat Video Iklan Campaign",
      description: "Produksi video iklan berdurasi 30 detik untuk peluncuran fitur baru di Instagram dan TikTok.",
      difficulty: "hard",
      dueDate: new Date("2026-05-20"),
      assignedTo: "Tim Kreatif",
      tags: ["marketing", "video", "campaign"],
      status: "in-progress",
      subtasks: [
        { id: "1a", title: "Konsep & Planner Iklan", assignedTo: "Evan Varian", avatarSeed: "evan", status: "completed" },
        { id: "1b", title: "Video Taking / Shooting", assignedTo: "Steven Nathaniel", avatarSeed: "steven", status: "in-progress" },
        { id: "1c", title: "Video Editing & Render", assignedTo: "Lie Darren", avatarSeed: "darren", status: "todo" },
      ]
    },
    {
      id: "2",
      team: "Marketing Campaign", 
      title: "Presentasi Matematika SMP",
      description: "Menyiapkan materi dan presentasi untuk acara edukasi anak SMP binaan CSR.",
      difficulty: "medium",
      dueDate: new Date("2026-05-15"),
      assignedTo: null,
      tags: ["education", "presentation"],
      status: "todo",
      subtasks: [] 
    }
  ]);

  const currentTeamTasks = tasks.filter(task => task.team === activeTeam);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // STATE BARU: Untuk efek loading saat Gemini API berjalan
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [formData, setFormData] = useState<Partial<Task>>({
    title: "", description: "", difficulty: "medium", dueDate: new Date(), tags: [], status: "todo", subtasks: []
  });

  const handleCreateTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      team: activeTeam, 
      title: formData.title || "",
      description: formData.description || "",
      difficulty: formData.difficulty || "medium",
      dueDate: formData.dueDate || new Date(),
      assignedTo: null, 
      tags: formData.tags || [],
      status: "todo",
      subtasks: []
    };
    setTasks([...tasks, newTask]);
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    setTasks(tasks.map(task => task.id === editingTask.id ? { ...task, ...formData } : task));
    setEditingTask(null);
    setDialogOpen(false);
    resetForm();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", difficulty: "medium", dueDate: new Date(), tags: [], status: "todo", subtasks: [] });
  };

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "expert": return "bg-purple-600"; case "hard": return "bg-red-600"; case "medium": return "bg-blue-600"; case "easy": return "bg-green-600"; default: return "bg-gray-600";
    }
  };

  // --- FUNGSI MANGGIL API GEMINI ---
  const handleRunAI = () => {
    setIsGeneratingAI(true);
    
    // Simulasi memanggil API Gemini selama 2.5 detik
    setTimeout(() => {
      const aiGeneratedSubtasks: SubTask[] = [
        { id: Date.now() + "a", title: "Riset dan Kumpulkan Materi Presentasi", assignedTo: "Evan Varian", avatarSeed: "evan", status: "todo" },
        { id: Date.now() + "b", title: "Desain Slide Presentasi (PPT) Menarik", assignedTo: "Lie Darren", avatarSeed: "darren", status: "todo" },
        { id: Date.now() + "c", title: "Latihan Public Speaking di depan Tim", assignedTo: "Steven Nathaniel", avatarSeed: "steven", status: "todo" }
      ];

      // Update state
      if (selectedTask) {
        const updatedTask = { ...selectedTask, subtasks: aiGeneratedSubtasks };
        setSelectedTask(updatedTask);
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      }
      
      setIsGeneratingAI(false);
    }, 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage tasks for <span className="font-semibold text-blue-600">{activeTeam}</span></p>
        </div>
        <Button className="gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 shadow-md text-white px-6" onClick={openCreateDialog}>
          <Plus className="w-4 h-4" /> Create Task
        </Button>
      </div>

      {/* MODAL FORM TASK */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : `Create Task for ${activeTeam}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" placeholder="e.g. Develop Mobile App UI" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="rounded-xl" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the overall goal of this task..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-xl min-h-[100px]" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Overall Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}>
                  <SelectTrigger className="rounded-xl bg-white"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem><SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Final Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl bg-white">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl bg-white">
                    <Calendar mode="single" selected={formData.dueDate} onSelect={(date) => setFormData({ ...formData, dueDate: date || new Date() })} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., frontend, design, urgent"
                value={formData.tags?.join(", ")}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="rounded-xl">Cancel</Button>
            <Button onClick={editingTask ? handleUpdateTask : handleCreateTask} className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white">
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DETAIL TASK & SUBTASKS (AREA KERJA AI) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="rounded-2xl max-w-3xl bg-white transition-all">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getDifficultyColor(selectedTask.difficulty)} text-white border-none px-3 py-1`}>{selectedTask.difficulty}</Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedTask.title}</DialogTitle>
                <DialogDescription className="text-base mt-2 text-slate-700">{selectedTask.description}</DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4 border-t mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2"><ListChecks className="w-5 h-5 text-indigo-600" /> Sub-tasks Breakdown</h3>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">{selectedTask.subtasks.length} tasks</Badge>
                </div>

                <div className="grid gap-3 min-h-[150px]">
                  
                  {/* --- KONDISI 1: AI SEDANG LOADING --- */}
                  {isGeneratingAI && (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-xl border border-slate-200">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                      <p className="text-slate-700 font-medium">Gemini AI is analyzing...</p>
                      <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">
                        Breaking down task and finding the best team members based on their skill matrix.
                      </p>
                    </div>
                  )}

                  {/* --- KONDISI 2: TUGAS KOSONG & TIDAK LOADING --- */}
                  {!isGeneratingAI && selectedTask.subtasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                      </div>
                      <p className="text-slate-700 font-medium">Belum ada pecahan sub-task.</p>
                      <p className="text-slate-500 text-sm mt-1 mb-5 text-center max-w-sm">
                        Biarkan AI membaca deskripsi tugas ini dan membagikannya secara otomatis ke anggota tim.
                      </p>
                      <Button 
                        onClick={handleRunAI} 
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-md px-6"
                      >
                        <Sparkles className="w-4 h-4 mr-2" /> Breakdown with AI
                      </Button>
                    </div>
                  )}

                  {/* --- KONDISI 3: SUB-TASK SUDAH ADA --- */}
                  {!isGeneratingAI && selectedTask.subtasks.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${sub.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-slate-300 bg-white'}`}>
                          {sub.status === 'completed' && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`font-medium ${sub.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{sub.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-slate-200">
                          <AvatarFallback className="bg-white text-xs font-semibold text-slate-700">{sub.assignedTo.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700 w-28 truncate">{sub.assignedTo}</span>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {currentTeamTasks.map((task) => (
          <Card 
            key={task.id} 
            onClick={() => openTaskDetails(task)}
            className="rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group bg-white border-slate-200"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getDifficultyColor(task.difficulty)} text-white rounded-md border-none px-3`}>{task.difficulty}</Badge>
                    <Badge variant="outline" className="rounded-md gap-1 bg-slate-50"><CalendarIcon className="w-3 h-3 text-slate-400" />{format(task.dueDate, "MMM dd")}</Badge>
                    <Badge variant="outline" className="rounded-md gap-1 bg-indigo-50 text-indigo-700 border-indigo-200"><Users className="w-3 h-3" />{task.subtasks.length} Sub-tasks</Badge>
                  </div>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(task)} className="rounded-xl hover:bg-blue-50 hover:text-blue-600 border-slate-200">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{task.title}" and all its sub-tasks across the team.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="rounded-xl bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentTeamTasks.length === 0 && (
        <Card className="rounded-2xl border-dashed border-2 bg-transparent shadow-none mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4 shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-xl mb-1 text-slate-900">No Tasks Yet</h3>
            <p className="text-sm text-slate-500">
              Create the first task for <span className="font-semibold text-slate-700">{activeTeam}</span>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}