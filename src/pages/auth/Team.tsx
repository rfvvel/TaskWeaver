import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, PlusCircle, ArrowRight, Building2, AlignLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import LogoTW2 from "../../components/layout/LogoTW2.png"; 

export function Team() {
  const navigate = useNavigate();
  
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  
  const [teamNameError, setTeamNameError] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let result = 'TW-';
    for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      setTeamNameError("Team Name tidak boleh kosong!");
      return; 
    }
    
    // 1. Ambil data lama dari LocalStorage
    const savedTeams = localStorage.getItem("tw_teams");
    const currentTeams = savedTeams ? JSON.parse(savedTeams) : [];

    // 2. Buat objek tim baru
    const newTeam = {
      id: `team-${Date.now()}`,
      name: teamName,
      description: teamDesc || "No description provided.",
      inviteCode: generateRandomCode(),
      bigTasks: [],
      members: [
        { id: `m-${Date.now()}`, name: "Rafael Vvel", email: "rafael.vvel@gmail.com", role: "admin", avatarSeed: "rafael", joinDate: `Joined ${new Date().toLocaleDateString()}` }
      ]
    };

    // 3. Simpan gabungan data lama dan baru ke LocalStorage
    currentTeams.push(newTeam);
    localStorage.setItem("tw_teams", JSON.stringify(currentTeams));
    
    // 4. Jadikan tim baru ini sebagai tim aktif di Dropdown
    localStorage.setItem("tw_activeTeam", teamName);

    navigate("/team-management");
  };

  const handleJoinTeam = () => {
    if (!joinCode.trim()) {
      setJoinCodeError("Invite Code tidak boleh kosong!");
      return; 
    }
    // Simulasi Join Team
    navigate("/team-management");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <img src={LogoTW2} alt="TaskWeaver Logo" className="w-12 h-12 object-cover rounded-xl shadow-sm mix-blend-multiply" />
          <h1 className="text-3xl font-bold text-blue-600">TaskWeaver AI</h1>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Welcome aboard, Rafael!</h2>
        <p className="text-slate-500 mt-2 max-w-md">To get started, you need to either create a new workspace for your team or join an existing one.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="border-border shadow-sm hover:shadow-md transition-all hover:border-blue-200">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600"><PlusCircle className="w-6 h-6" /></div>
            <CardTitle>Create a New Team</CardTitle>
            <CardDescription>Start fresh. Set up a new workspace and invite your team members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Team Name</label>
              <Input placeholder="e.g. CS Project Team" className={`bg-white ${teamNameError ? "border-red-500 focus-visible:ring-red-500" : ""}`} value={teamName} onChange={(e) => { setTeamName(e.target.value); if (teamNameError) setTeamNameError(""); }} />
              {teamNameError && <p className="text-xs text-red-500 font-medium">{teamNameError}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="relative"><AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="e.g. Final Project for Software Engineering" className="bg-white pl-9" value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} /></div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2" onClick={handleCreateTeam}>
              Create Team & Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-all hover:border-indigo-200">
          <CardHeader>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600"><Users className="w-6 h-6" /></div>
            <CardTitle>Join Existing Team</CardTitle>
            <CardDescription>Already have a team? Enter the invite code provided by your Team Lead to collaborate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Invite Code</label>
              <Input placeholder="e.g. TW-8X9P2" className={`bg-white uppercase tracking-widest ${joinCodeError ? "border-red-500 focus-visible:ring-red-500" : ""}`} value={joinCode} onChange={(e) => { setJoinCode(e.target.value); if (joinCodeError) setJoinCodeError(""); }} />
               {joinCodeError && <p className="text-xs text-red-500 font-medium">{joinCodeError}</p>}
            </div>
            <div className="h-[72px]"></div> 
            <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 mt-2" onClick={handleJoinTeam}>
              Join Team <Building2 className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}