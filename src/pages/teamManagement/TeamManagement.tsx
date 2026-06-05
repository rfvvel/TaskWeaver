import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Users, LogOut, CheckCircle2, Circle, Clock, Plus, LogIn, Copy, Check, AlignLeft, ClipboardList, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";

interface BigTask { id: string; title: string; status: "todo" | "in-progress" | "completed"; deadline: string; }
interface TeamMember { id: string; name: string; email: string; role: "admin" | "member"; avatarSeed: string; joinDate: string; }
interface Team { id: string; name: string; description: string; inviteCode: string; members: TeamMember[]; bigTasks: BigTask[]; }

const formatDate = (dateStr: string) => {
  if (!dateStr) return "No Date";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ─── FIX: Robust user ID resolution from localStorage ───────────────────────
// Handles all possible key casings that may come from different login flows
const resolveUserId = (user: Record<string, any>): string | null => {
  const id =
    user?.UserID ??
    user?.userId ??
    user?.user_id ??
    user?.id ??
    user?.ID ??
    null;
  return id != null ? String(id) : null;
};

export function TeamManagement() {
  const navigate = useNavigate();

  const { teams, setTeams, activeTeam, setActiveTeam } = useOutletContext<{
    teams: Team[], setTeams: (t: Team[]) => void,
    activeTeam: string, setActiveTeam: (t: string) => void
  }>();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [teamNameError, setTeamNameError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const getLoggedInUser = (): Record<string, any> | null => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const fetchUserTeams = async () => {
    const user = getLoggedInUser();
    if (!user) return;

    // FIX: use robust resolveUserId instead of one-liner chain
    const userId = resolveUserId(user);
    if (!userId) {
      console.error("[TeamManagement] fetchUserTeams: cannot resolve userId from", user);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/groupGetGroupByUserId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });

      const result = await response.json();

      if (response.ok && result.status === "sukses") {
        const teamsWithMembers = await Promise.all(result.data.map(async (g: any) => {
          let membersList: TeamMember[] = [];
          let bigTasksList: BigTask[] = [];

          try {
            const memRes = await fetch("http://localhost:3000/api/groupGetMember", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ group_id: g.group_id })
            });
            const memData = await memRes.json();

            if (memRes.ok && memData.status === "sukses") {
              membersList = memData.data.map((m: any) => ({
                id: String(m.user_id),
                name: m.user_full_name || m.name || "Unknown User",
                email: m.user_email || "No Email",
                role: m.user_role === 'A' ? "admin" : "member",
                avatarSeed: m.user_full_name || "U",
                joinDate: m.join_date || "Joined recently"
              }));
            }
          } catch (e) {
            console.error(`Gagal mengambil member untuk grup ${g.group_id}`, e);
          }

          try {
            const taskRes = await fetch("http://localhost:3000/api/taskGetByGroup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ Group_Id: g.group_id })
            });
            const taskData = await taskRes.json();

            if (taskRes.ok && taskData.status === "sukses" && taskData.data) {
              bigTasksList = taskData.data.map((t: any) => ({
                id: String(t.task_id || t.TaskId),
                title: t.task_title || t.TaskName,
                status: t.task_status || t.status || "todo",
                deadline: t.deadline || t.TaskDeadline
              }));
            }
          } catch (e) {
            console.error(`Gagal mengambil task untuk grup ${g.group_id}`, e);
          }

          let inviteCode = g.group_invite_code || g.group_invitecode || g.invite_code || null;
          if (!inviteCode) {
            try {
              const invRes = await fetch("http://localhost:3000/api/groupGetInviteCode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group_id: g.group_id })
              });
              const invData = await invRes.json();
              if (invRes.ok && invData.status === "sukses" && invData.data?.[0]) {
                inviteCode = invData.data[0].group_invitecode
                  || invData.data[0].invite_code
                  || invData.data[0].group_invite_code
                  || null;
              }
            } catch (e) {
              console.error(`Gagal mengambil invite code untuk grup ${g.group_id}`, e);
            }
          }

          return {
            id: String(g.group_id),
            name: g.group_name,
            description: g.group_description || "No description provided.",
            inviteCode: inviteCode || "No invite code",
            members: membersList,
            bigTasks: bigTasksList
          };
        }));

        setTeams(teamsWithMembers);

        if (teamsWithMembers.length > 0 && !activeTeam) {
          setActiveTeam(teamsWithMembers[0].name);
          localStorage.setItem("tw_activeTeam", teamsWithMembers[0].name);
        }
      }
    } catch (error) {
      console.error("Gagal memproses data workspace:", error);
    }
  };

  useEffect(() => {
    fetchUserTeams();
  }, []);

  const openTeamTasks = (team: Team) => { setSelectedTeam(team); setTaskDialogOpen(true); };

  const goToTaskManagement = (teamName: string) => {
    setActiveTeam(teamName);
    localStorage.setItem("tw_activeTeam", teamName);
    setTaskDialogOpen(false);
    navigate("/task-management");
  };

  const handleCreateTaskForTeam = (teamName: string) => {
    setActiveTeam(teamName);
    localStorage.setItem("tw_activeTeam", teamName);
    setTaskDialogOpen(false);
    navigate("/task-management");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code); setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLeaveTeam = async (teamId: string) => {
    const user = getLoggedInUser();
    if (!user) {
      alert("Login session lost. Please log in again.");
      return;
    }

    // FIX: use robust resolveUserId
    const userId = resolveUserId(user);
    if (!userId) {
      alert("Gagal mendapatkan User ID. Coba logout dan login kembali.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/groupKick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: teamId,
          user_id: userId,
          user_requester_id: userId
        })
      });

      const result = await response.json();

      if (response.ok && result.status === "sukses") {
        const teamToLeave = teams.find(t => t.id === teamId);
        const updatedTeams = teams.filter(team => team.id !== teamId);

        setTeams(updatedTeams);

        if (teamToLeave?.name === activeTeam) {
          const nextTeam = updatedTeams.length > 0 ? updatedTeams[0].name : "No Team";
          setActiveTeam(nextTeam);
          if (updatedTeams.length > 0) {
            localStorage.setItem("tw_activeTeam", nextTeam);
          } else {
            localStorage.removeItem("tw_activeTeam");
          }
        }

        alert("Berhasil keluar dari tim!");
      } else {
        alert(result.pesan || "Gagal keluar dari tim.");
      }
    } catch (error) {
      console.error("Error Leave Team:", error);
      alert("Tidak bisa terhubung ke server.");
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let result = 'TW-';
    for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleJoinTeam = async () => {
    if (!inviteCodeInput.trim()) {
      setJoinCodeError("Invite Code tidak boleh kosong!");
      return;
    }

    const user = getLoggedInUser();
    if (!user) return;

    // FIX: use robust resolveUserId
    const userId = resolveUserId(user);
    if (!userId) {
      setJoinCodeError("Gagal mendapatkan User ID. Coba logout dan login kembali.");
      return;
    }

    setIsJoining(true);
    setJoinCodeError("");

    try {
      const resCheck = await fetch("http://localhost:3000/api/groupGetGroupbyInviteCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCodeInput.toUpperCase() })
      });
      const resultCheck = await resCheck.json();

      if (!resCheck.ok || resultCheck.status !== "sukses" || !resultCheck.data) {
        setJoinCodeError("Invite code invalid or group does not exist.");
        setIsJoining(false);
        return;
      }

      const groupId = resultCheck.data.group_id || resultCheck.data.id;

      const resJoin = await fetch("http://localhost:3000/api/groupJoin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, user_id: userId, user_role: "M" })
      });
      const resultJoin = await resJoin.json();

      if (resJoin.ok && resultJoin.status === "sukses") {
        setJoinDialogOpen(false);
        setInviteCodeInput("");
        setJoinCodeError("");
        window.location.reload();
      } else {
        setJoinCodeError(resultJoin.pesan || "Gagal bergabung ke tim.");
      }
    } catch (error) {
      console.error("Error Join Team:", error);
      setJoinCodeError("Tidak bisa terhubung ke server.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setTeamNameError("Team Name tidak boleh kosong!");
      return;
    }

    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
      alert("Sesi login habis atau tidak ditemukan. Silakan login kembali.");
      return;
    }

    // FIX: use robust resolveUserId — this was the primary cause of data not saving
    const userId = resolveUserId(loggedInUser);
    if (!userId) {
      alert(`Gagal mendapatkan User ID. Data user di localStorage: ${JSON.stringify(loggedInUser)}. Coba logout dan login kembali.`);
      return;
    }

    const generatedCode = generateRandomCode();

    setIsCreating(true);
    setTeamNameError("");

    try {
      console.log("[TeamManagement] handleCreateTeam payload:", {
        group_name: newTeamName,
        user_id: userId,
        group_description: newTeamDesc || "No description provided.",
        invite_code: generatedCode
      });

      const response = await fetch("http://localhost:3000/api/groupCreate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          group_name: newTeamName,
          user_id: userId,
          group_description: newTeamDesc || "No description provided.",
          invite_code: generatedCode
        })
      });

      const result = await response.json();

      console.log("[TeamManagement] handleCreateTeam response:", result);

      if (response.ok && result.status === "sukses") {
        // Close dialog and reset form
        setCreateDialogOpen(false);
        setNewTeamName("");
        setNewTeamDesc("");

        setActiveTeam(newTeamName);
        localStorage.setItem("tw_activeTeam", newTeamName);

        // Refresh teams list from database
        await fetchUserTeams();
        alert("Tim baru berhasil dibuat dan disimpan ke database!");
      } else {
        // FIX: show the actual server error message to help debugging
        const errorMsg = result.pesan || result.message || "Gagal membuat tim. Cek console untuk detail.";
        alert(`Gagal membuat tim: ${errorMsg}`);
        console.error("[TeamManagement] Create team failed:", result);
      }
    } catch (error) {
      console.error("Error Create Team:", error);
      alert("Gagal terhubung ke server backend. Pastikan server backend Anda berjalan di port 3000 dan CORS diizinkan.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1 text-slate-500 dark:text-slate-400">Create, join, and manage your teams</p>
        </div>
        <div className="flex gap-3">

          <Dialog open={joinDialogOpen} onOpenChange={(open) => { setJoinDialogOpen(open); if (!open) { setInviteCodeInput(""); setJoinCodeError(""); } }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">
                <LogIn className="w-4 h-4" /> Join Team
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-md">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Join a Workspace</DialogTitle>
                <DialogDescription className="dark:text-slate-400">Enter the invite code provided by your team admin.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Team Code</Label>
                  <Input
                    placeholder="e.g., TW-8X9P2"
                    className={`rounded-xl font-mono uppercase tracking-widest bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white ${joinCodeError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={inviteCodeInput}
                    onChange={(e) => { setInviteCodeInput(e.target.value.toUpperCase()); if (joinCodeError) setJoinCodeError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleJoinTeam(); }}
                  />
                  {joinCodeError && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                      {joinCodeError}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setJoinDialogOpen(false); setInviteCodeInput(""); setJoinCodeError(""); }} className="rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" disabled={isJoining}>Cancel</Button>
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={!inviteCodeInput || isJoining} onClick={handleJoinTeam}>
                  {isJoining ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : "Join Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"><Plus className="w-4 h-4" /> Create Team</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-md">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Create a New Team</DialogTitle>
                <DialogDescription className="dark:text-slate-400">Set up a workspace. A unique invite code will be generated automatically.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Team Name <span className="text-red-500">*</span></Label>
                  <Input placeholder="e.g. Frontend Squad" className={`rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white ${teamNameError ? "border-red-500 dark:border-red-500" : ""}`} value={newTeamName} onChange={(e) => { setNewTeamName(e.target.value); if (teamNameError) setTeamNameError(""); }} />
                  {teamNameError && <p className="text-xs text-red-500 font-medium">{teamNameError}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Description <span className="text-slate-400 font-normal dark:text-slate-500">(Optional)</span></Label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input placeholder="e.g. React developers team" className="rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white pl-9" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Auto-Generated Code</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">You can share this code later.</p>
                  </div>
                  <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono tracking-widest text-blue-600 dark:text-blue-400">TW-#####</Badge>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" disabled={isCreating}>Cancel</Button>
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateTeam} disabled={!newTeamName.trim() || isCreating}>
                  {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2 dark:text-white">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  {selectedTeam.name} - Big Tasks
                </DialogTitle>
                <DialogDescription className="dark:text-slate-400">Click on a task to enter Task Management.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 grid gap-3">
                {selectedTeam.bigTasks.map((task) => (
                  <Card key={task.id} onClick={() => goToTaskManagement(selectedTeam.name)} className="p-4 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : task.status === 'in-progress' ? <Clock className="w-5 h-5 text-blue-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{task.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Due: {formatDate(task.deadline)}</p>
                      </div>
                    </div>
                  </Card>
                ))}

                {selectedTeam.bigTasks.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center">
                    <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No task available</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6 max-w-[250px] text-center">Tim ini belum memiliki tugas. Buat tugas pertama agar anggota tim bisa mulai bekerja.</p>
                    <Button onClick={() => handleCreateTaskForTeam(selectedTeam.name)} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md px-6"><Plus className="w-4 h-4 mr-2" /> Create Task</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        {teams.map((team) => (
          <Card key={team.id} className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            <div onClick={() => openTeamTasks(team)} className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0"><Users className="w-7 h-7" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{team.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{team.description}</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" onClick={(e) => e.stopPropagation()} className="rounded-full text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 dark:border-red-900/50 hover:text-red-600 gap-2 px-4 shrink-0">
                    <LogOut className="w-4 h-4" /> Leave Team
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-slate-400">You are about to leave <strong>{team.name}</strong>. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={() => handleLeaveTeam(team.id)}>Yes, Leave Team</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <CardContent className="pt-6">
              <Tabs defaultValue="members" className="w-full">
                <TabsList className="rounded-xl mb-4 bg-slate-100/50 dark:bg-slate-800/60 p-1">
                  <TabsTrigger value="members" className="rounded-lg dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">Members ({team.members.length})</TabsTrigger>
                  <TabsTrigger value="invite" className="rounded-lg dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">Invite</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4 focus-visible:outline-none">
                  <div className="space-y-1">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
                            <AvatarFallback className="bg-white dark:bg-slate-800 dark:text-slate-300">
                              {member.name ? member.name.split(" ").map(n => n[0]).join("") : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900 dark:text-slate-200">{member.name}</h4>
                              <Badge variant="secondary" className={`px-2 py-0 text-[10px] uppercase rounded-md tracking-wider font-semibold ${member.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {member.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-400 dark:text-slate-500">{member.joinDate}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="invite" className="space-y-6 pt-2 focus-visible:outline-none">
                  <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Team Invite Code</Label>
                    <div className="flex items-center gap-3 mt-3">
                      <code className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg text-slate-800 dark:text-slate-200 font-bold tracking-widest shadow-sm">
                        {team.inviteCode}
                      </code>
                      <Button
                        variant={copiedCode === team.inviteCode ? "default" : "outline"}
                        onClick={() => handleCopyCode(team.inviteCode)}
                        className={`rounded-xl h-12 px-5 transition-all shrink-0 ${copiedCode === team.inviteCode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                      >
                        {copiedCode === team.inviteCode ? <><Check className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Code</>}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}

        {teams.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">You are not in any team</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Join an existing workspace or create a new one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}