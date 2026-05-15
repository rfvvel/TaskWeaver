import { useState } from "react";
import { Brain, Sparkles, TrendingUp, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

// Data Sejarah
const distributionHistory = [
  { date: "Feb 14, 2026", tasks: 24, balanced: true, time: "10:30 AM" },
  { date: "Feb 10, 2026", tasks: 21, balanced: true, time: "2:15 PM" },
  { date: "Feb 6, 2026", tasks: 18, balanced: false, time: "11:00 AM" },
];

const aiInsights = [
  { type: "optimization", title: "Skill Matching", description: "Tasks are optimally matched to team member skills with 92% accuracy", score: 92 },
  { type: "balance", title: "Workload Balance", description: "Current distribution achieves 88% fairness across all team members", score: 88 },
  { type: "efficiency", title: "Efficiency Gain", description: "AI distribution saves approximately 3.5 hours per week in manual allocation", score: 95 },
];

// Matriks Skill (Sudah disesuaikan dengan nama tim)
const teamSkillMatrix = [
  { name: "Lie Darren", skills: { "UI Design": 95, "Prototyping": 90, "Frontend": 60, "Video": 40 } },
  { name: "Steven Nathaniel", skills: { "Backend": 95, "Database": 90, "API Design": 85, "Testing": 70 } },
  { name: "Evan Varian", skills: { "Frontend": 95, "React": 95, "UI Design": 70, "Testing": 60 } },
  { name: "Kevin Mahardika", skills: { "Documentation": 90, "Proposal": 95, "Project Mgt": 85, "Testing": 50 } },
  { name: "Rafael Vvel", skills: { "Testing": 95, "QA": 95, "Fullstack": 85, "DevOps": 65 } },
];

export function AIDistribution() {
  const [isDistributing, setIsDistributing] = useState(false);
  const [hasDistributed, setHasDistributed] = useState(false); // State baru untuk nampilin draf
  const [isPublished, setIsPublished] = useState(false); // State jika sudah disetujui

  const handleDistribute = () => {
    setIsDistributing(true);
    setHasDistributed(false);
    setIsPublished(false);
    
    // Simulasi AI sedang berpikir selama 2.5 detik
    setTimeout(() => {
      setIsDistributing(false);
      setHasDistributed(true); // Munculkan draf usulan
    }, 2500);
  };

  const handlePublish = () => {
    setIsPublished(true);
    // Di dunia nyata, ini akan nge-HIT API ke backend untuk nyebar tugas ke MyTasks
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-1">AI Task Distribution</h1>
        <p className="text-muted-foreground">Intelligent task allocation & workload balancing review</p>
      </div>

      {/* AI Control Panel */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-indigo-900 mb-1">AI Distribution Engine</h3>
                <p className="text-sm text-indigo-700">
                  Click run to let AI analyze skills and propose the best task assignments for pending big tasks.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleDistribute}
              disabled={isDistributing || isPublished}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl shadow-lg px-8"
            >
              {isDistributing ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Profiles...
                </>
              ) : isPublished ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Distributed Successfully
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* HASIL DRAF USULAN AI (Muncul Setelah Loading) */}
      {hasDistributed && !isPublished && (
        <Card className="border-green-200 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-green-50/50 border-b border-green-100 pb-4">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Proposed Distribution Ready for Review
            </CardTitle>
            <CardDescription className="text-green-700">
              AI has formulated a plan. Review the assignments below before officially publishing them to the team's "My Tasks".
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              
              {/* Contoh Draf Pembagian */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Design Authentication UI</h4>
                  <p className="text-sm text-slate-500 mt-1">Requires: UI Design (Expert), Prototyping</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 mx-4" />
                <div className="flex-1 flex items-center gap-3 justify-end">
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700">95% Match</Badge>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">Lie Darren</p>
                    <p className="text-xs text-slate-500">Current Load: 24h</p>
                  </div>
                  <Avatar className="w-10 h-10 border border-slate-200">
                    <AvatarFallback>LD</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Setup SQL Database Schema</h4>
                  <p className="text-sm text-slate-500 mt-1">Requires: Backend, Database Architecture</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 mx-4" />
                <div className="flex-1 flex items-center gap-3 justify-end">
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700">92% Match</Badge>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">Steven Nathaniel</p>
                    <p className="text-xs text-slate-500">Current Load: 18h</p>
                  </div>
                  <Avatar className="w-10 h-10 border border-slate-200">
                    <AvatarFallback>SN</AvatarFallback>
                  </Avatar>
                </div>
              </div>

            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm px-8 py-6 text-lg">
                Approve & Publish to "My Tasks"
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights (Metrik Persentase) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiInsights.map((insight, idx) => (
          <Card key={idx} className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{insight.title}</h4>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center">
                    {insight.type === "optimization" && <Zap className="w-5 h-5 text-indigo-600" />}
                    {insight.type === "balance" && <Users className="w-5 h-5 text-cyan-600" />}
                    {insight.type === "efficiency" && <TrendingUp className="w-5 h-5 text-purple-600" />}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-semibold text-indigo-600">{insight.score}%</span>
                  </div>
                  <Progress value={insight.score} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for Details */}
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList className="bg-muted rounded-xl">
          <TabsTrigger value="skills" className="rounded-lg">Skill Matrix</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg">Distribution History</TabsTrigger>
          <TabsTrigger value="algorithm" className="rounded-lg">Algorithm Details</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Team Skill Matrix</CardTitle>
              <CardDescription>AI uses this data to match tasks with the right team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {teamSkillMatrix.map((member, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {/* AvatarImage di-komen sesuai request */}
                      {/* <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name.toLowerCase().replace(' ', '')}`} /> */}
                      <AvatarFallback className="bg-slate-200">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <h4 className="font-medium text-foreground">{member.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(member.skills).map(([skill, level]) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{skill}</span>
                          <span className="font-medium text-indigo-600">{level}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full transition-all"
                            style={{ width: `${level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Distribution History</CardTitle>
              <CardDescription>Previous AI distribution runs and their outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {distributionHistory.map((run, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${run.balanced ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <p className="font-medium text-foreground">{run.date} at {run.time}</p>
                        <p className="text-sm text-muted-foreground">{run.tasks} tasks distributed</p>
                      </div>
                    </div>
                    <Badge variant={run.balanced ? "default" : "secondary"} className={run.balanced ? "bg-green-600 text-white hover:bg-green-700" : ""}>
                      {run.balanced ? "Balanced" : "Rebalanced"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="algorithm" className="space-y-4">
          {/* Konten Algorithm Details tetap sama */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Distribution Algorithm</CardTitle>
              <CardDescription>How TaskWeaver AI intelligently allocates tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-semibold text-indigo-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Skill Matching</h4>
                    <p className="text-sm text-muted-foreground">
                      Analyzes task requirements and matches them with team member skill profiles using weighted scoring
                    </p>
                  </div>
                </div>
                {/* Sisanya bisa kamu biarkan atau lengkapi seperti sebelumnya */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
