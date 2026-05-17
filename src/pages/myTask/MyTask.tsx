import { useState } from "react";
import {
  CheckCircle2, Circle, Clock, Flag, Search, Filter, 
  Link as LinkIcon, UploadCloud, FileText, X
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export function MyTasks() {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  // STATE UNTUK POPUP SUBMIT
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submittingTaskId, setSubmittingTaskId] = useState<number | null>(null);
  
  // State untuk menyimpan bukti kerja
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionFile, setSubmissionFile] = useState<string | null>(null); // <-- Tambahan state file

  const [tasks, setTasks] = useState([
    {
      id: 1, title: "Design authentication flow UI", status: "in-progress", priority: "high",
      deadline: "Feb 16, 2026", estimatedHours: 8, completed: false, category: "UI Design",
    },
    {
      id: 2, title: "Create user profile components", status: "todo", priority: "medium",
      deadline: "Feb 18, 2026", estimatedHours: 6, completed: false, category: "Frontend",
    },
    {
      id: 3, title: "Review API documentation", status: "in-progress", priority: "high",
      deadline: "Feb 16, 2026", estimatedHours: 4, completed: false, category: "Documentation",
    },
    {
      id: 4, title: "Set up testing environment", status: "completed", priority: "low",
      deadline: "Feb 14, 2026", estimatedHours: 3, completed: true, category: "Testing",
    },
    {
      id: 5, title: "Update project proposal", status: "todo", priority: "medium",
      deadline: "Feb 20, 2026", estimatedHours: 5, completed: false, category: "Documentation",
    },
  ]);

  const toggleTask = (id: number) => {
    setSelectedTasks((prev) => prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]);
  };

  const moveTask = (id: number, newStatus: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus, completed: newStatus === "completed" } : task
      )
    );
  };

  const openSubmitDialog = (id: number) => {
    setSubmittingTaskId(id);
    setSubmissionLink(""); 
    setSubmissionFile(null); // Reset file form
    setSubmitDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSubmissionFile(e.target.files[0].name);
    }
  };

  const confirmSubmit = () => {
    if (submittingTaskId !== null) {
      // (Di tahap backend nanti, kita kirim submissionLink atau submissionFile ke database di sini)
      moveTask(submittingTaskId, "completed");
    }
    setSubmitDialogOpen(false);
    setSubmittingTaskId(null);
  };

  const getPriorityColor = (priority: string) => {
    const colors = { high: "bg-red-50 text-red-700 border-red-200", medium: "bg-yellow-50 text-yellow-700 border-yellow-200", low: "bg-blue-50 text-blue-700 border-blue-200" };
    return colors[priority as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "in-progress") return <Clock className="w-5 h-5 text-blue-600" />;
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  const filterTasks = (status?: string) => {
    if (!status) return tasks;
    return tasks.filter((task) => task.status === status);
  };

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">My Tasks</h1>
        <p className="text-muted-foreground">Manage and track your assigned tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm"><CardContent className="p-4"><div className="text-center"><p className="text-2xl font-semibold text-foreground">{totalTasks}</p><p className="text-sm text-muted-foreground">Total Tasks</p></div></CardContent></Card>
        <Card className="border-border shadow-sm"><CardContent className="p-4"><div className="text-center"><p className="text-2xl font-semibold text-blue-600">{inProgressTasks}</p><p className="text-sm text-muted-foreground">Proceed</p></div></CardContent></Card>
        <Card className="border-border shadow-sm"><CardContent className="p-4"><div className="text-center"><p className="text-2xl font-semibold text-green-600">{completedTasks}</p><p className="text-sm text-muted-foreground">Completed</p></div></CardContent></Card>
        <Card className="border-border shadow-sm"><CardContent className="p-4"><div className="text-center"><p className="text-2xl font-semibold text-orange-600">{totalHours}h</p><p className="text-sm text-muted-foreground">Est. Hours</p></div></CardContent></Card>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-10 rounded-xl bg-white" />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl bg-white"><Filter className="w-4 h-4" /> Filter</Button>
      </div>

      {/* Tabs List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-slate-100/50 rounded-xl p-1">
          <TabsTrigger value="all" className="rounded-lg">All Tasks</TabsTrigger>
          <TabsTrigger value="todo" className="rounded-lg">To Do</TabsTrigger>
          <TabsTrigger value="in-progress" className="rounded-lg">In Progress</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
        </TabsList>

        {/* --- ALL TASKS CONTENT --- */}
        <TabsContent value="all" className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className={`border-border bg-white shadow-sm hover:shadow-md transition-shadow ${task.completed ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox checked={selectedTasks.includes(task.id)} onCheckedChange={() => toggleTask(task.id)} className="mt-1" />
                  {getStatusIcon(task.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.estimatedHours}h</span>
                      <span className="flex items-center gap-1"><Flag className="w-4 h-4" />{task.deadline}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-100">{task.category}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {task.status !== "todo" && ( <Button size="sm" variant="outline" onClick={() => moveTask(task.id, "todo")}>To Do</Button> )}
                      {task.status !== "in-progress" && ( <Button size="sm" onClick={() => moveTask(task.id, "in-progress")}>In Progress</Button> )}
                      {task.status !== "completed" && ( <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openSubmitDialog(task.id)}>Complete</Button> )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* --- TO DO CONTENT --- */}
        <TabsContent value="todo" className="space-y-3">
          {filterTasks("todo").map((task) => (
            <Card key={task.id} className="border-border bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox />
                  {getStatusIcon(task.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.estimatedHours}h</span>
                      <span className="flex items-center gap-1"><Flag className="w-4 h-4" />{task.deadline}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-100">{task.category}</Badge>
                    </div>
                    <div className="pt-2"><Button size="sm" onClick={() => moveTask(task.id, "in-progress")}>Proceed</Button></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* --- IN PROGRESS CONTENT --- */}
        <TabsContent value="in-progress" className="space-y-3">
          {filterTasks("in-progress").map((task) => (
            <Card key={task.id} className="border-border bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox />
                  {getStatusIcon(task.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.estimatedHours}h</span>
                      <span className="flex items-center gap-1"><Flag className="w-4 h-4" />{task.deadline}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-100">{task.category}</Badge>
                    </div>
                    <div className="pt-2"><Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openSubmitDialog(task.id)}>Complete</Button></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* --- COMPLETED CONTENT --- */}
        <TabsContent value="completed" className="space-y-3">
          {filterTasks("completed").map((task) => (
            <Card key={task.id} className="border-border bg-white shadow-sm opacity-60">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox checked disabled />
                  {getStatusIcon(task.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.estimatedHours}h</span>
                      <span className="flex items-center gap-1"><Flag className="w-4 h-4" />{task.deadline}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-100">{task.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* --- MODAL POPUP SUBMIT WORK (DIPERBARUI) --- */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-2xl bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Your Work</DialogTitle>
            <DialogDescription>
              Silakan lampirkan tautan URL atau unggah file dokumen hasil kerjamu sebelum menyelesaikan tugas ini.
            </DialogDescription>
          </DialogHeader>

          {/* Area Tabs di Dalam Modal */}
          <Tabs defaultValue="link" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl mb-4">
              <TabsTrigger value="link" className="rounded-lg">Link URL</TabsTrigger>
              <TabsTrigger value="file" className="rounded-lg">Upload File</TabsTrigger>
            </TabsList>
            
            {/* Opsi 1: Submit Link */}
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

            {/* Opsi 2: Submit File Upload */}
            <TabsContent value="file" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Document File</Label>
                {!submissionFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, DOCX, ZIP (Max 25MB)</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate">{submissionFile}</span>
                        <span className="text-xs text-green-600 font-medium">Ready to submit</span>
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

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={confirmSubmit} 
              className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
              disabled={!submissionLink.trim() && !submissionFile} 
            >
              Submit & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}