import { useState } from "react";
import { useOutletContext } from "react-router-dom"; // ALAT PENANGKAP DATA DARI LAYOUT
import { CheckCircle2, Circle, Clock, Flag, Search, Filter, UploadCloud, Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

// Data dummy dengan "team" penanda dinamis (tanpa priority)
const initialTasks = [
  { id: 1, team: "CS Project Team", title: "Design authentication flow UI", status: "in-progress", deadline: "Feb 16, 2026", estimatedHours: 8, category: "UI Design" },
  { id: 2, team: "CS Project Team", title: "Create user profile components", status: "todo", deadline: "Feb 18, 2026", estimatedHours: 6, category: "Frontend" },
  { id: 3, team: "CS Project Team", title: "Review API documentation", status: "in-progress", deadline: "Feb 16, 2026", estimatedHours: 4, category: "Documentation" },
  { id: 4, team: "CS Project Team", title: "Set up testing environment", status: "completed", deadline: "Feb 14, 2026", estimatedHours: 3, category: "Testing" },
  
  // Tugas untuk tim yang berbeda
  { id: 5, team: "Marketing Campaign", title: "Buat storyboard Iklan TikTok", status: "todo", deadline: "Feb 20, 2026", estimatedHours: 5, category: "Video" },
  { id: 6, team: "Marketing Campaign", title: "Riset hashtag kompetitor", status: "completed", deadline: "Feb 18, 2026", estimatedHours: 2, category: "Research" },
];

export function MyTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  
  // MENANGKAP DATA TIM DARI DROPDOWN DI LAYOUT.TSX
  const { activeTeam } = useOutletContext<{ activeTeam: string }>();

  // State untuk Pop-up Submit
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<typeof initialTasks[0] | null>(null);
  const [fileUrl, setFileUrl] = useState("");

  // FUNGSI FILTER: Hanya ambil tugas yang sesuai dengan tim yang dipilih
  const currentTeamTasks = tasks.filter(task => task.team === activeTeam);

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "in-progress") return <Clock className="w-5 h-5 text-blue-600" />;
    return <Circle className="w-5 h-5 text-slate-300" />;
  };

  const filterTasksByStatus = (status?: string) => {
    if (!status) return currentTeamTasks;
    return currentTeamTasks.filter(task => task.status === status);
  };

  // Fungsi saat task diklik
  const handleTaskClick = (task: typeof initialTasks[0]) => {
    if (task.status === "completed") return; // Kalau sudah selesai, tidak usah muncul pop-up
    setSelectedTask(task);
    setSubmitDialogOpen(true);
  };

  // Fungsi saat tombol "Mark as Completed" ditekan
  const handleSubmitWork = () => {
    if (!selectedTask) return;
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: "completed" } : t));
    setSubmitDialogOpen(false);
    setFileUrl("");
  };

  // FUNGSI PEMBANTU: Agar tidak capek copy-paste desain kartu di setiap Tab
  const renderTaskList = (statusFilter?: string) => {
    const filteredTasks = filterTasksByStatus(statusFilter);

    if (filteredTasks.length === 0) {
      return <p className="text-center py-8 text-slate-500">Belum ada tugas di kategori ini.</p>;
    }

    return (
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <Card 
            key={task.id} 
            onClick={() => handleTaskClick(task)}
            className={`border-border shadow-sm transition-all bg-white ${task.status === 'completed' ? 'opacity-60' : 'cursor-pointer hover:border-blue-300 hover:shadow-md'}`}
          >
            <CardContent className="p-4 flex items-start gap-4">
              <div className="mt-1">{getStatusIcon(task.status)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-slate-900'}`}>{task.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.estimatedHours}h</span>
                  <span className="flex items-center gap-1"><Flag className="w-4 h-4" />{task.deadline}</span>
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">{task.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-1">My Tasks</h1>
          {/* Teks dinamis mengikuti state context */}
          <p className="text-muted-foreground">Manage and track your assigned tasks for <span className="font-semibold text-blue-600">{activeTeam}</span></p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm bg-white"><CardContent className="p-4"><div className="text-center"><p className="text-2xl font-semibold text-foreground">{currentTeamTasks.length}</p><p className="text-sm text-muted-foreground">Total Tasks</p></div></CardContent></Card>
        <Card className="border-border shadow-sm bg-white"><CardContent className="p-4"><div className="text-center"><p className="text-2xl font-semibold text-blue-600">{currentTeamTasks.filter(t=>t.status==='in-progress').length}</p><p className="text-sm text-muted-foreground">In Progress</p></div></CardContent></Card>
        <Card className="border-border shadow-sm bg-white"><CardContent className="p-4"><div className="text-center"><p className="text-2xl font-semibold text-green-600">{currentTeamTasks.filter(t=>t.status==='completed').length}</p><p className="text-sm text-muted-foreground">Completed</p></div></CardContent></Card>
        <Card className="border-border shadow-sm bg-white"><CardContent className="p-4"><div className="text-center"><p className="text-2xl font-semibold text-orange-600">{currentTeamTasks.reduce((acc, curr) => acc + curr.estimatedHours, 0)}h</p><p className="text-sm text-muted-foreground">Est. Hours</p></div></CardContent></Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={`Search tasks in ${activeTeam}...`} className="pl-10 rounded-xl bg-white" />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl bg-white">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted rounded-xl">
          <TabsTrigger value="all" className="rounded-lg">All Tasks</TabsTrigger>
          <TabsTrigger value="todo" className="rounded-lg">To Do</TabsTrigger>
          <TabsTrigger value="in-progress" className="rounded-lg">In Progress</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderTaskList()}</TabsContent>
        <TabsContent value="todo">{renderTaskList("todo")}</TabsContent>
        <TabsContent value="in-progress">{renderTaskList("in-progress")}</TabsContent>
        <TabsContent value="completed">{renderTaskList("completed")}</TabsContent>
      </Tabs>

      {/* MODAL POP-UP PENGUMPULAN TUGAS */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-2xl bg-white max-w-md">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>Submit Your Work</DialogTitle>
                <DialogDescription>
                  Upload file atau masukkan link hasil kerjamu untuk menyelesaikan tugas <span className="font-semibold text-slate-900">"{selectedTask.title}"</span>.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Click to upload file</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, ZIP, Figma, or Images</p>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-medium">Or attach link</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="space-y-2">
                  <Label>Project / File URL</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="https://github.com/..." 
                      className="pl-9 rounded-xl bg-white" 
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleSubmitWork} className="rounded-xl bg-green-600 text-white hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Completed
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}