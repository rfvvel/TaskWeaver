import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Users, LogOut, Search, Mail, Shield, CheckCircle2, Circle, Clock, Plus, LogIn, Copy, Check, AlignLeft, ClipboardList } from "lucide-react";
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

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [teamNameError, setTeamNameError] = useState("");

  const getLoggedInUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    const fetchUserTeams = async () => {
      const user = getLoggedInUser();
      if (!user) return;
      const userId = user.UserID || user.id || user.user_id;

      try {
        const response = await fetch("http://localhost:3000/api/groupGetGroupByUserId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId })
        });

        const result = await response.json();

        if (response.ok && result.status === "sukses") {
          
          // 2. Looping setiap tim untuk mengambil data MEMBER-nya sekaligus
          const teamsWithMembers = await Promise.all(result.data.map(async (g: any) => {
            let membersList: TeamMember[] = [];
            
            try {
              // Tembak API GetMember untuk grup ini
              const memRes = await fetch("http://localhost:3000/api/groupGetMember", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group_id: g.group_id })
              });
              
              const memData = await memRes.json();
              
              if (memRes.ok && memData.status === "sukses") {
                // Terjemahkan data member dari DB ke format React
                membersList = memData.data.map((m: any) => ({
                  id: String(m.user_id || m.id || Math.random()),
                  name: m.user_fullname || m.UserFullName || m.name || `User ${m.user_id}`,
                  email: m.user_email || m.UserEmail || m.email || "No Email",
                  // Berdasarkan screenshot SQL-mu, role Admin biasanya huruf 'A'
                  role: (m.user_role === 'A' || m.role === 'admin') ? "admin" : "member",
                  avatarSeed: m.user_fullname || m.UserFullName || "user",
                  joinDate: "Joined recently"
                }));
              }
            } catch (e) {
              console.error(`Gagal mengambil member untuk grup ${g.group_id}`, e);
            }

            // Kembalikan objek tim utuh yang sudah ada anggota & invite code-nya
            return {
              id: String(g.group_id),
              name: g.group_name,
              description: g.group_description || "No description provided.",
              inviteCode: g.group_invite_code || "---", // Menarik dari model yang baru di-update
              members: membersList,
              bigTasks: []
            };
          }));

          // 3. Pasang semua data yang sudah lengkap ke State Layar
          setTeams(teamsWithMembers);

          if (teamsWithMembers.length > 0 && !activeTeam) {
            setActiveTeam(teamsWithMembers[0].name);
            localStorage.setItem("tw_activeTeam", teamsWithMembers[0].name);
          }
        }
      } catch (error) {
        console.error("❌ Gagal menarik data:", error);
      }
    };

    fetchUserTeams();
  }, []);

  const openTeamTasks = (team: Team) => { setSelectedTeam(team); setTaskDialogOpen(true); };

  const goToTaskManagement = () => { setTaskDialogOpen(false); navigate("/task-management"); };

  const handleCreateTaskForTeam = (teamName: string) => {
    setActiveTeam(teamName);
    setTaskDialogOpen(false);
    navigate("/task-management");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code); setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLeaveTeam = (teamId: string) => {
    const teamToLeave = teams.find(t => t.id === teamId);
    const updatedTeams = teams.filter(team => team.id !== teamId);
    setTeams(updatedTeams);
    
    if (teamToLeave?.name === activeTeam) {
      setActiveTeam(updatedTeams.length > 0 ? updatedTeams[0].name : "No Team");
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let result = 'TW-';
    for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) { setTeamNameError("Team Name tidak boleh kosong!"); return; }

    const newTeam: Team = {
      id: `team-${Date.now()}`, name: newTeamName, description: newTeamDesc || "No description provided.", inviteCode: generateRandomCode(), bigTasks: [],
      members: [ { id: `m-${Date.now()}`, name: "Rafael Vvel", email: "rafael.vvel@gmail.com", role: "admin", avatarSeed: "rafael", joinDate: `Joined ${new Date().toLocaleDateString()}` } ]
    };

    setTeams([...teams, newTeam]);
    setActiveTeam(newTeam.name);
    setCreateDialogOpen(false); 
    setNewTeamName(""); setNewTeamDesc("");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
          <p className="text-muted-foreground mt-1">Create, join, and manage your teams</p>
        </div>
        <div className="flex gap-3">
          
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild><Button variant="outline" className="gap-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50"><LogIn className="w-4 h-4" /> Join Team</Button></DialogTrigger>
            <DialogContent className="rounded-2xl bg-white max-w-md">
              <DialogHeader><DialogTitle>Join a Workspace</DialogTitle><DialogDescription>Enter the invite code provided by your team admin.</DialogDescription></DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2"><Label>Team Code</Label><Input placeholder="e.g., TW-8X9P2" className="rounded-xl font-mono uppercase" value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setJoinDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button className="rounded-xl bg-blue-600 text-white" disabled={!inviteCodeInput} onClick={() => { setJoinDialogOpen(false); setInviteCodeInput(""); }}>Join Team</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild><Button className="gap-2 rounded-xl bg-blue-600 text-white"><Plus className="w-4 h-4" /> Create Team</Button></DialogTrigger>
            <DialogContent className="rounded-2xl bg-white max-w-md">
              <DialogHeader><DialogTitle>Create a New Team</DialogTitle><DialogDescription>Set up a workspace. A unique invite code will be generated automatically.</DialogDescription></DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Team Name <span className="text-red-500">*</span></Label>
                  <Input placeholder="e.g. Frontend Squad" className={`rounded-xl bg-white ${teamNameError ? "border-red-500" : ""}`} value={newTeamName} onChange={(e) => { setNewTeamName(e.target.value); if (teamNameError) setTeamNameError(""); }} />
                  {teamNameError && <p className="text-xs text-red-500 font-medium">{teamNameError}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description <span className="text-slate-400 font-normal">(Optional)</span></Label>
                  <div className="relative"><AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="e.g. React developers team" className="rounded-xl bg-white pl-9" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} /></div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mt-2 flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-slate-700">Auto-Generated Code</p><p className="text-xs text-slate-500">You can share this code later.</p></div>
                  <Badge variant="outline" className="bg-white border-slate-200 font-mono tracking-widest text-blue-600">TW-#####</Badge>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button className="rounded-xl bg-blue-600 text-white" onClick={handleCreateTeam} disabled={!newTeamName.trim()}>Create Team</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="rounded-2xl max-w-lg bg-white">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2"><div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><Users className="w-4 h-4" /></div>{selectedTeam.name} - Big Tasks</DialogTitle>
                <DialogDescription>Klik salah satu tugas untuk masuk ke Task Management.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 grid gap-3">
                {selectedTeam.bigTasks.map((task) => (
                  <Card key={task.id} onClick={goToTaskManagement} className="p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group bg-slate-50">
                    <div className="flex items-center gap-3">
                      {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : task.status === 'in-progress' ? <Clock className="w-5 h-5 text-blue-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                      <div className="flex-1"><h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</h4><p className="text-xs text-slate-500 mt-1">Due: {task.deadline}</p></div>
                    </div>
                  </Card>
                ))}
                {selectedTeam.bigTasks.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center">
                    <ClipboardList className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-slate-700 font-semibold text-lg">No task available</p>
                    <p className="text-slate-500 text-sm mt-1 mb-6 max-w-[250px]">Tim ini belum memiliki tugas. Buat tugas pertama agar anggota tim bisa mulai bekerja.</p>
                    <Button onClick={() => handleCreateTaskForTeam(selectedTeam.name)} className="rounded-xl bg-blue-600 text-white shadow-md px-6"><Plus className="w-4 h-4 mr-2" /> Create Task</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        {teams.map((team) => (
          <Card key={team.id} className="rounded-2xl shadow-sm border-slate-200 overflow-hidden bg-white animate-in slide-in-from-bottom-4 duration-300">
            <div onClick={() => openTeamTasks(team)} className="p-6 border-b border-slate-100 flex items-start justify-between cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm"><Users className="w-7 h-7" /></div>
                <div><h2 className="text-2xl font-bold text-slate-900">{team.name}</h2><p className="text-slate-500 text-sm mt-1">{team.description}</p></div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="outline" onClick={(e) => e.stopPropagation()} className="rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-2 px-4"><LogOut className="w-4 h-4" /> Leave Team</Button></AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>You are about to leave <strong>{team.name}</strong>. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction className="rounded-xl bg-red-600 text-white" onClick={() => handleLeaveTeam(team.id)}>Yes, Leave Team</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <CardContent className="pt-6">
              <Tabs defaultValue="members" className="w-full">
                <TabsList className="rounded-xl mb-4 bg-slate-100/50">
                  <TabsTrigger value="members" className="rounded-lg">Members ({team.members.length})</TabsTrigger>
                  <TabsTrigger value="invite" className="rounded-lg">Invite</TabsTrigger>
                </TabsList>
                <TabsContent value="members" className="space-y-4">
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 border border-slate-200"><AvatarFallback className="bg-white">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                          <div>
                            <div className="flex items-center gap-2"><h4 className="font-medium text-slate-900">{member.name}</h4><Badge className={`px-2 py-0 text-[10px] uppercase rounded-md ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>{member.role}</Badge></div>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-400">{member.joinDate}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="invite" className="space-y-6 pt-2">
                  <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50">
                    <Label className="text-sm font-semibold text-slate-700">Team Invite Code</Label>
                    <div className="flex items-center gap-3 mt-3">
                      <code className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-lg text-slate-800 font-bold tracking-widest shadow-sm">{team.inviteCode}</code>
                      <Button variant={copiedCode === team.inviteCode ? "default" : "outline"} onClick={() => handleCopyCode(team.inviteCode)} className={`rounded-xl h-12 px-5 ${copiedCode === team.inviteCode ? 'bg-green-500 text-white' : 'bg-white'}`}>
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
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">You are not in any team</h3>
            <p className="text-slate-500 mt-1 mb-6">Join an existing workspace or create a new one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}