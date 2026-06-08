import { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus, Edit, Trash2, Calendar as CalendarIcon, ListChecks,
  Users, Sparkles, Loader2, FileText, X, Paperclip, RefreshCw
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
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API = "https://projecttaskweaverbackend-production.up.railway.app/api";

interface SubTask {
  detail_task_id: number;
  task_id: number;
  user_id: number;
  detail_task_name: string;
  detail_task_deadline: string;
  detail_task_status: string;
  assigned_user_name?: string;
}
interface Task {
  TaskId: number;
  Group_Id: number;
  TaskName: string;
  TaskDescription: string;
  TaskComplexity: number;
  TaskDeadline: string;
  TaskPrerequisite: number | null;
  task_status: string;
  subtasks?: SubTask[];
}
interface Member {
  user_id: number;
  user_full_name: string;
  user_role: string;
}

function safeFormat(dateStr: any, fmt: string) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Invalid date" : format(d, fmt);
}

function getDifficultyColor(score: number) {
  if (score >= 8) return "bg-purple-600";
  if (score >= 6) return "bg-red-600";
  if (score >= 4) return "bg-blue-600";
  return "bg-green-600";
}

function getDifficultyLabel(score: number) {
  if (score >= 8) return "Expert";
  if (score >= 6) return "Hard";
  if (score >= 4) return "Medium";
  return "Easy";
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    completed: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50",
    "in-progress": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
    todo: "bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400",
  };
  return map[status] ?? map["todo"];
}

function MiniCalendar({ selected, onSelect }: { selected?: Date; onSelect: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(selected ?? new Date());
  const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });

  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }

  const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="p-3 select-none w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {format(viewDate, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="h-8 flex items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-500">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, viewDate);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={i}
              onClick={() => onSelect(day)}
              className={[
                "h-8 w-full flex items-center justify-center text-sm rounded-md transition-colors",
                !isCurrentMonth && "text-slate-300 dark:text-slate-600",
                isCurrentMonth && !isSelected && !isToday && "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                isToday && !isSelected && "font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100",
                isSelected && "bg-indigo-600 text-white font-semibold hover:bg-indigo-700",
              ].filter(Boolean).join(" ")}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TaskManagement() {
  const { activeTeam, teams } = useOutletContext<{ activeTeam: string; teams: any[] }>();
  
  const currentTeamObj = teams?.find(t => t.name === activeTeam);
  
  const activeGroupId = currentTeamObj?.group_id || currentTeamObj?.id;

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.UserID || currentUser?.user_id || currentUser?.id || null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [_members, setMembers] = useState<Member[]>([]);
  
  const [taskNameError, setTaskNameError] = useState("");
  const [taskDescError, setTaskDescError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taskFile, setTaskFile] = useState<File | null>(null);

  const emptyForm = {
    TaskName: "", TaskDescription: "", TaskComplexity: 5,
    TaskDeadline: new Date().toISOString(), TaskPrerequisite: null as number | null,
  };
  const [formData, setFormData] = useState(emptyForm);

  const fetchTasks = useCallback(async () => {
    if (!activeGroupId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/taskGetByGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Group_Id: activeGroupId }),
      });
      const json = await res.json();
      if (json.status === "sukses") {
        const normalizedTasks = (json.data ?? []).map((t: any) => ({
          TaskId: t.task_id || t.TaskId,
          Group_Id: t.group_id || t.Group_Id,
          TaskName: t.task_title || t.TaskName,
          TaskDescription: t.task_description || t.TaskDescription,
          TaskComplexity: t.complexity_score || t.TaskComplexity,
          TaskDeadline: t.deadline || t.TaskDeadline,
          TaskPrerequisite: t.prerequisite_task_id || t.TaskPrerequisite,
          task_status: t.task_status || t.status || "todo",
        }));
        setTasks(normalizedTasks);
      }
    } catch (err) {
      console.error("Gagal fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [activeGroupId]);

  const fetchMembers = useCallback(async () => {
    if (!activeGroupId) return;
    try {
      const res = await fetch(`${API}/groupGetMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: activeGroupId }),
      });
      const json = await res.json();
      if (json.status === "sukses") setMembers(json.data ?? []);
    } catch (err) {
      console.error("Gagal fetch members:", err);
    }
  }, [activeGroupId]);

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [fetchTasks, fetchMembers]);

  const fetchSubtasks = async (task_id: number) => {
    setLoadingSubtasks(true);
    try {
      const res = await fetch(`${API}/detailTaskGetByTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id }),
      });
      const json = await res.json();
      if (json.status === "sukses") {
        const normalizedSubtasks = (json.data ?? []).map((s: any) => ({
          detail_task_id: s.detail_task_id || s.DetailTaskId,
          task_id: s.task_id || s.TaskId,
          user_id: s.user_id || s.UserId,
          detail_task_name: s.detail_task_name || s.DetailTaskName,
          detail_task_deadline: s.detail_task_deadline || s.DetailTaskDeadline,
          detail_task_status: s.detail_task_status || s.DetailTaskStatus,
          assigned_user_name: s.UserFullName || s.user_full_name || s.assigned_user_name,
        }));
        setSubtasks(normalizedSubtasks);
      } else {
        setSubtasks([]);
      }
    } catch (err) {
      console.error("Gagal fetch subtasks:", err);
      setSubtasks([]);
    } finally {
      setLoadingSubtasks(false);
    }
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
    fetchSubtasks(task.TaskId);
  };

  const handleCreateTask = async () => {
    let hasError = false;
    if (!formData.TaskName.trim()) { setTaskNameError("Task Title wajib diisi!"); hasError = true; }
    if (!formData.TaskDescription.trim()) { setTaskDescError("Description wajib diisi!"); hasError = true; }
    
    if (hasError) return;

    try {
      const res = await fetch(`${API}/taskCreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Group_id: activeGroupId,
          TaskName: formData.TaskName,
          TaskDescription: formData.TaskDescription,
          TaskComplexity: formData.TaskComplexity,
          TaskDeadline: formData.TaskDeadline,
          TaskPrerequisite: formData.TaskPrerequisite,
          CreatorId: currentUserId,
        }),
      });
      const json = await res.json();
      if (json.status === "sukses") {
        setDialogOpen(false);
        resetForm();
        fetchTasks();
      } else {
        alert("Gagal membuat task: " + json.pesan);
      }
    } catch (err) {
      console.error("Gagal create task:", err);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    
    let hasError = false;
    if (!formData.TaskName.trim()) { setTaskNameError("Task Title wajib diisi!"); hasError = true; }
    if (!formData.TaskDescription.trim()) { setTaskDescError("Description wajib diisi!"); hasError = true; }
    
    if (hasError) return;

    try {
      const res = await fetch(`${API}/taskUpdate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Task_Id: editingTask.TaskId,
          TaskName: formData.TaskName,
          TaskDescription: formData.TaskDescription,
          TaskComplexity: formData.TaskComplexity,
          TaskDeadline: formData.TaskDeadline,
          TaskPrerequisite: formData.TaskPrerequisite,
        }),
      });
      const json = await res.json();
      if (json.status === "sukses") {
        setEditingTask(null);
        setDialogOpen(false);
        resetForm();
        fetchTasks();
      } else {
        alert("Gagal update task: " + json.pesan);
      }
    } catch (err) {
      console.error("Gagal update task:", err);
    }
  };

  const handleDeleteTask = async (task_id: number, task_title: string) => {
    try {
      const res = await fetch(`${API}/taskDelete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Task_Id: task_id, requester_user_Id: currentUserId }),
      });
      const json = await res.json();
      if (json.status === "sukses") {
        try {
          await fetch(`${API}/activityCreate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task_id: task_id, 
              user_id: currentUserId,
              action_type: "D", 
              action_description: `deleted big task "${task_title}"` 
            })
          });
        } catch (logErr) {
          console.error("Gagal mencatat log hapus:", logErr);
        }

        fetchTasks();
        if (selectedTask?.TaskId === task_id) setDetailsOpen(false);
      } else {
        alert("Gagal hapus task: " + json.pesan);
      }
    } catch (err) {
      console.error("Gagal delete task:", err);
    }
  };

  const handleRunAI = async () => {
    if (!selectedTask) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`${API}/taskBreakdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: selectedTask.TaskId,
          group_id: activeGroupId,
          task_title: selectedTask.TaskName,
          task_description: selectedTask.TaskDescription,
          task_deadline: selectedTask.TaskDeadline,
          complexity_score: selectedTask.TaskComplexity,
        }),
      });
      const json = await res.json();
      if (json.status === "sukses") {
        await fetchSubtasks(selectedTask.TaskId);
      } else {
        alert("AI Breakdown gagal: " + json.pesan);
      }
    } catch (err) {
      console.error("Gagal AI breakdown:", err);
      alert("Terjadi kesalahan saat menghubungi AI.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRebalance = async () => {
    if (!selectedTask) return;
    setIsRebalancing(true);
    try {
      const res = await fetch(`${API}/taskRebalance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: selectedTask.TaskId,
          group_id: activeGroupId,
          task_title: selectedTask.TaskName,
          task_description: selectedTask.TaskDescription,
          task_deadline: selectedTask.TaskDeadline,
        }),
      });
      const json = await res.json();
      if (json.status === "sukses") {
        await fetchSubtasks(selectedTask.TaskId);
        alert(json.pesan);
      } else {
        alert("Rebalance gagal: " + json.pesan);
      }
    } catch (err) {
      console.error("Gagal rebalance:", err);
    } finally {
      setIsRebalancing(false);
    }
  };

  // ── Toggle subtask status ──
  const toggleSubtaskStatus = async (sub: SubTask) => {
    const newStatus = sub.detail_task_status === "completed" ? "todo" : "completed";
    try {
      await fetch(`${API}/detailTaskUpdateStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detail_task_id: sub.detail_task_id, new_status: newStatus }),
      });
      setSubtasks(prev =>
        prev.map(s => s.detail_task_id === sub.detail_task_id ? { ...s, detail_task_status: newStatus } : s)
      );
    } catch (err) {
      console.error("Gagal update status subtask:", err);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setTaskFile(null); 
    setTaskNameError("");
    setTaskDescError("");
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      TaskName: task.TaskName,
      TaskDescription: task.TaskDescription,
      TaskComplexity: task.TaskComplexity,
      TaskDeadline: task.TaskDeadline,
      TaskPrerequisite: task.TaskPrerequisite,
    });
    setTaskFile(null);
    setTaskNameError("");
    setTaskDescError("");
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskFile(e.target.files[0]);
    }
  };

  // ─────────────────────────────────────────────────────────────
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
          className="gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 shadow-md text-white px-6"
          onClick={openCreateDialog}
          disabled={!activeGroupId}
        >
          <Plus className="w-4 h-4" /> Create Task
        </Button>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border dark:border-slate-800">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : `Create Task for ${activeTeam}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input placeholder="e.g. Develop Mobile App UI" value={formData.TaskName}
                onChange={(e) => {
                  setFormData({ ...formData, TaskName: e.target.value });
                  if (taskNameError) setTaskNameError("");
                }}
                className={`rounded-xl dark:bg-slate-950 dark:border-slate-800 ${taskNameError ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
              {taskNameError && <p className="text-xs text-red-500 mt-1">{taskNameError}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the overall goal..." value={formData.TaskDescription}
                onChange={(e) => {
                  setFormData({ ...formData, TaskDescription: e.target.value });
                  if (taskDescError) setTaskDescError("");
                }}
                className={`rounded-xl min-h-[100px] dark:bg-slate-950 dark:border-slate-800 ${taskDescError ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
              {taskDescError && <p className="text-xs text-red-500 mt-1">{taskDescError}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Attachment (Optional)</Label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Select File
                </Button>
                {taskFile && (
                  <Badge variant="secondary" className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 px-3 py-1">
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{taskFile.name}</span>
                    <button type="button" onClick={() => setTaskFile(null)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Complexity Score (1-10)</Label>
                <Input type="number" min={1} max={10} value={formData.TaskComplexity}
                  onChange={(e) => setFormData({ ...formData, TaskComplexity: Number(e.target.value) })}
                  className="rounded-xl dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label>Final Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl dark:bg-slate-950 dark:border-slate-800">
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {formData.TaskDeadline ? format(new Date(formData.TaskDeadline), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl bg-white dark:bg-slate-950 border dark:border-slate-800">
                    <MiniCalendar
                      selected={formData.TaskDeadline ? new Date(formData.TaskDeadline) : undefined}
                      onSelect={(date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFormData({ ...formData, TaskDeadline: `${year}-${month}-${day}T23:59:59` });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="rounded-xl dark:border-slate-800">Cancel</Button>
            <Button onClick={editingTask ? handleUpdateTask : handleCreateTask}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white">
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details + AI Breakdown Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="rounded-2xl max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border dark:border-slate-800">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getDifficultyColor(selectedTask.TaskComplexity)} text-white border-none px-3 py-1`}>
                    {getDifficultyLabel(selectedTask.TaskComplexity)} (Score: {selectedTask.TaskComplexity})
                  </Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedTask.TaskName}</DialogTitle>
                <DialogDescription className="text-base mt-2 dark:text-slate-300 whitespace-pre-line">
                  {selectedTask.TaskDescription}
                </DialogDescription>
                <p className="text-sm text-slate-500 mt-1">
                  Deadline: {safeFormat(selectedTask.TaskDeadline, "PPP")}
                </p>
              </DialogHeader>

              <div className="py-4 space-y-4 border-t dark:border-slate-800 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Sub-tasks Breakdown
                  </h3>
                  <div className="flex gap-2">
                    {subtasks.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRebalance}
                        disabled={isRebalancing}
                        className="rounded-xl text-xs gap-1 dark:border-slate-700"
                      >
                        {isRebalancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Rebalance with AI
                      </Button>
                    )}
                    <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
                      {subtasks.length} tasks
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 min-h-[150px]">
                  {(isGeneratingAI || isRebalancing || loadingSubtasks) && (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {isGeneratingAI ? "AI is analyzing the task..." : isRebalancing ? "Rebalancing workload..." : "Loading subtasks..."}
                      </p>
                      <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">
                        {isGeneratingAI ? "Breaking down and assigning to team members based on skill." : ""}
                      </p>
                    </div>
                  )}

                  {!isGeneratingAI && !isRebalancing && !loadingSubtasks && subtasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">No sub-tasks yet.</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-5 text-center max-w-sm">
                        Let AI auto-assign sub-tasks to the team based on their skills.
                      </p>
                      <Button onClick={handleRunAI}
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-md px-6">
                        <Sparkles className="w-4 h-4 mr-2" /> Breakdown with AI
                      </Button>
                    </div>
                  )}

                  {!isGeneratingAI && !isRebalancing && !loadingSubtasks && subtasks.map((sub) => (
                    <div key={sub.detail_task_id}
                      className="flex items-center justify-between p-4 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      onClick={() => toggleSubtaskStatus(sub)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${sub.detail_task_status === "completed" ? "bg-green-500 border-green-500" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"}`}>
                          {sub.detail_task_status === "completed" && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className={`font-medium ${sub.detail_task_status === "completed" ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100"}`}>
                            {sub.detail_task_name}
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Deadline: {safeFormat(sub.detail_task_deadline, "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-800">
                          <AvatarFallback className="bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {sub.assigned_user_name
                              ? sub.assigned_user_name.split(" ").map((n: string) => n[0]).join("")
                              : `U${sub.user_id}`}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-28 truncate">
                          {sub.assigned_user_name ?? `User ${sub.user_id}`}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${getStatusColor(sub.detail_task_status)}`}>
                          {sub.detail_task_status}
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
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.TaskId} onClick={() => openTaskDetails(task)}
              className="rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.TaskName}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{task.TaskDescription}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getDifficultyColor(task.TaskComplexity)} text-white rounded-md border-none px-3`}>
                        {getDifficultyLabel(task.TaskComplexity)}
                      </Badge>
                      <Badge variant="outline" className="rounded-md gap-1 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                        <CalendarIcon className="w-3 h-3 text-slate-400" />
                        {safeFormat(task.TaskDeadline, "MMM dd")}
                      </Badge>
                      <Badge variant="outline" className="rounded-md gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50">
                        <Users className="w-3 h-3" /> {task.task_status ?? "todo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(task)}
                      className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon"
                          className="rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border dark:border-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-slate-400">
                            This will permanently delete "{task.TaskName}" and all its sub-tasks.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl dark:border-slate-800">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTask(task.TaskId, task.TaskName)}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-none">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <Card className="rounded-2xl border-dashed border-2 bg-transparent border-slate-200 dark:border-slate-800 shadow-none mt-8">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <h3 className="font-semibold text-xl mb-1 text-slate-900 dark:text-slate-50">No Tasks Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create the first task for <span className="font-semibold">{activeTeam}</span>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}