import { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCircle2, Circle, Clock, Flag, Search, Inbox, UploadCloud, FileText, X, Link as LinkIcon, Loader2, Eye, Download } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { format } from "date-fns";

const API = "http://localhost:3000/api";

interface MyTask {
  id: number;
  taskId: number;
  groupId: string; 
  teamNameFromDB: string; 
  title: string;
  bigTaskTitle: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "completed" | "C";
  category: string;
}

function safeFormat(dateStr: any, fmt: string) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Invalid date" : format(d, fmt);
}

export function MyTasks() {
  const { teams } = useOutletContext<{ teams: any[] }>();

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.UserID || currentUser?.user_id || currentUser?.id || null;

  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
        const formattedTasks: MyTask[] = (json.data || []).map((t: any) => ({
          id: t.DetailTaskId || t.detail_task_id,
          taskId: t.TaskId || t.task_id,
          groupId: String(t.group_id || t.GroupId || ""), 
          teamNameFromDB: t.group_name || t.GroupName || "",
          title: t.DetailTaskName || t.detail_task_name,
          bigTaskTitle: `Task #${t.TaskId || t.task_id}`,
          deadline: t.DetailTaskDeadline || t.detail_task_deadline,
          priority: "medium",
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
  }, [currentUserId]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const updateTaskStatus = async (detailTaskId: number, newStatus: string) => {
    try {
      setMyTasks(prev => prev.map(t => t.id === detailTaskId ? { ...t, status: newStatus as any } : t));
      
      await fetch(`${API}/detailTaskUpdateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detail_task_id: detailTaskId, new_status: newStatus }),
      });

      const task = myTasks.find(t => t.id === detailTaskId);
      if (task) {
        const actionType = newStatus === "in-progress" ? "I" : "C";
        const actionDesc = newStatus === "in-progress" ? "started" : "completed";
        await fetch(`${API}/activityCreate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_id: task.taskId, 
            user_id: currentUserId,
            action_type: actionType,
            action_description: `${actionDesc} "${task.title}"` 
          })
        });
      }

      fetchMyTasks();
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  // State Modal Submit
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submittingTask, setSubmittingTask] = useState<MyTask | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionCategory, setSubmissionCategory] = useState("document");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("link");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<MyTask | null>(null);
  const [viewingFiles, setViewingFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const openSubmitDialog = (task: MyTask) => {
    setSubmittingTask(task);
    setSubmissionLink("");
    setSubmissionFile(null);
    setSubmissionCategory("document");
    setSubmitDialogOpen(true);
  };

  const openViewDialog = async (task: MyTask) => {
    setViewingTask(task);
    setViewDialogOpen(true);
    setIsLoadingFiles(true);
    setViewingFiles([]);

    const taskGroupId = task.groupId;

    if (taskGroupId) {
      try {
        const res = await fetch(`${API}/getTaskFilesByGroup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group_id: taskGroupId })
        });
        const json = await res.json();
        if (json.status === "sukses") {
          const filesForThisTask = (json.data || []).filter(
            (f: any) => String(f.detail_task_id) === String(task.id)
          );
          setViewingFiles(filesForThisTask);
        }
      } catch (err) {
        console.error("Gagal fetch files untuk preview:", err);
      }
    }
    setIsLoadingFiles(false);
  };

  const confirmSubmit = async () => {
    if (!submittingTask || !currentUserId) return;
    
    const taskGroupId = submittingTask.groupId;

    if (!taskGroupId) {
      alert("Error: Tugas ini tidak memiliki ID Tim yang valid.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "file" && submissionFile) {
        const formData = new FormData();
        formData.append("file", submissionFile);
        formData.append("detail_task_id", String(submittingTask.id));
        formData.append("uploaded_by", String(currentUserId));
        formData.append("group_id", String(taskGroupId)); 
        formData.append("file_category", submissionCategory); 

        const res = await fetch(`${API}/insertTaskFile`, {
          method: "POST",
          body: formData, 
        });
        
        const json = await res.json();
        if (json.status !== "sukses") {
           alert("Gagal upload file: " + json.pesan);
           setIsSubmitting(false);
           return;
        }
      } 
      
      await updateTaskStatus(submittingTask.id, "completed");
      setSubmitDialogOpen(false);
      setSubmittingTask(null);
      setSubmissionFile(null);
      
    } catch (err) {
      console.error("Error submit work:", err);
      alert("Terjadi kesalahan sistem saat mengirim data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (s: string) => {
    if (s === "completed" || s === "C") return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
    if (s === "in-progress") return <Clock className="w-5 h-5 text-blue-500 shrink-0" />;
    return <Circle className="w-5 h-5 text-muted-foreground shrink-0" />;
  };

  const filtered = (status?: string) => {
    let list = status ? myTasks.filter((t) => (status === "completed" ? (t.status === "completed" || t.status === "C") : t.status === status)) : myTasks;
    if (search.trim()) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  };

  const TaskCard = ({ task, showActions = true }: { task: MyTask; showActions?: boolean }) => {
    const matchedTeam = teams?.find((t: any) => String(t.group_id || t.id) === String(task.groupId));
    const displayTeamName = task.teamNameFromDB || matchedTeam?.name || "Unknown Team";

    return (
      <Card className={`border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow ${(task.status === "completed" || task.status === "C") ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {getStatusIcon(task.status)}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={`font-medium ${(task.status === "completed" || task.status === "C") ? "line-through text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    From: <span className="font-medium text-indigo-500 dark:text-indigo-400">{task.bigTaskTitle}</span> · <span className="font-semibold text-slate-600 dark:text-slate-300">{displayTeamName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  {safeFormat(task.deadline, "MMM dd, yyyy")}
                </span>
              </div>

              {showActions && task.status !== "completed" && task.status !== "C" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {task.status !== "in-progress" && (
                    <Button size="sm" variant="outline" className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => updateTaskStatus(task.id, "in-progress")}>
                      Start
                    </Button>
                  )}
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-none" onClick={() => openSubmitDialog(task)}>
                    Complete
                  </Button>
                </div>
              )}

              {showActions && (task.status === "completed" || task.status === "C") && (
                <div className="flex flex-wrap gap-2 pt-1 mt-1">
                  <Button size="sm" variant="outline" 
                    className="border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" 
                    onClick={() => openViewDialog(task)}>
                    <Eye className="w-4 h-4 mr-1.5" /> View Work
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-1">My Tasks</h1>
        <p className="text-slate-500 dark:text-slate-400">
          All sub-tasks assigned to you across your teams
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search your tasks..."
            className="pl-10 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 border-slate-200 dark:border-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-slate-500"><p>Loading your tasks...</p></div>
      ) : myTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="font-semibold text-xl text-slate-900 dark:text-slate-50 mb-1">No tasks assigned yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
            Sub-tasks assigned to you via <span className="font-medium text-indigo-500">AI Breakdown</span> will appear here.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg dark:data-[state=active]:bg-slate-700">All ({myTasks.length})</TabsTrigger>
            <TabsTrigger value="todo" className="rounded-lg dark:data-[state=active]:bg-slate-700">To Do ({myTasks.filter(t=>t.status==="todo").length})</TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-lg dark:data-[state=active]:bg-slate-700">In Progress ({myTasks.filter(t=>t.status==="in-progress").length})</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg dark:data-[state=active]:bg-slate-700">Completed ({myTasks.filter(t=>t.status==="completed" || t.status==="C").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filtered().map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="todo" className="space-y-3">
            {filtered("todo").map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="in-progress" className="space-y-3">
            {filtered("in-progress").map((t) => <TaskCard key={t.id} task={t} />)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-3">
            {filtered("completed").map((t) => <TaskCard key={t.id} task={t} showActions={true} />)}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:max-w-md text-slate-900 dark:text-slate-50">
          <DialogHeader>
            <DialogTitle>Submit Your Work</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Attach a link or upload a file to mark <span className="font-semibold text-slate-900 dark:text-slate-100">"{submittingTask?.title}"</span> as completed.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="link" className="w-full mt-2" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-4 p-1">
              <TabsTrigger value="link" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Link URL</TabsTrigger>
              <TabsTrigger value="file" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Upload File</TabsTrigger>
            </TabsList>
            
            <TabsContent value="link" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Submission URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="e.g. https://github.com/..."
                    className="rounded-xl pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4 py-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Document File</Label>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && setSubmissionFile(e.target.files[0])}
                  />
                  {!submissionFile ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-indigo-500">Click to upload</span></p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{submissionFile.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSubmissionFile(null)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={submissionCategory}
                    onChange={(e) => setSubmissionCategory(e.target.value)}
                  >
                    <option value="design">Design</option>
                    <option value="document">Document</option>
                    <option value="code">Code</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} disabled={isSubmitting} className="rounded-xl border-slate-200 dark:border-slate-700">
              Cancel
            </Button>
            <Button 
              onClick={confirmSubmit} 
              disabled={isSubmitting || (activeTab === "link" ? !submissionLink.trim() : !submissionFile)}
              className="rounded-xl bg-green-600 hover:bg-green-700 text-white border-none min-w-[140px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit & Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:max-w-md text-slate-900 dark:text-slate-50">
          <DialogHeader>
            <DialogTitle>Submitted Work</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Files attached for <span className="font-semibold text-slate-900 dark:text-slate-100">"{viewingTask?.title}"</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 min-h-[100px]">
            {isLoadingFiles ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
                <p className="text-sm text-slate-500">Checking attachments...</p>
              </div>
            ) : viewingFiles.length > 0 ? (
              viewingFiles.map((file) => (
                <div key={file.file_id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.file_name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => window.open(file.file_url, '_blank')} 
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
                <Inbox className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">No files attached</p>
                <p className="text-xs">User only clicked Complete or submitted a link.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="rounded-xl border-slate-200 dark:border-slate-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}