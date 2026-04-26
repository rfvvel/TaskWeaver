import { useState } from "react";
import { Brain, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const distributionHistory = [
  { date: "Feb 14, 2026", tasks: 24, balanced: true, time: "10:30 AM" },
  { date: "Feb 10, 2026", tasks: 21, balanced: true, time: "2:15 PM" },
  { date: "Feb 6, 2026", tasks: 18, balanced: false, time: "11:00 AM" },
];

const aiInsights = [
  {
    type: "optimization",
    title: "Skill Matching",
    description: "Tasks are optimally matched to team member skills with 92% accuracy",
    score: 92
  },
  {
    type: "balance",
    title: "Workload Balance",
    description: "Current distribution achieves 88% fairness across all team members",
    score: 88
  },
  {
    type: "efficiency",
    title: "Efficiency Gain",
    description: "AI distribution saves approximately 3.5 hours per week in manual task allocation",
    score: 95
  },
];

const teamSkillMatrix = [
  { name: "Sarah Chen", skills: { "UI Design": 95, "Prototyping": 90, "Frontend": 60, "Testing": 40 } },
  { name: "Michael Rodriguez", skills: { "Backend": 95, "API Design": 90, "Frontend": 65, "Testing": 70 } },
  { name: "Emily Watson", skills: { "Frontend": 95, "React": 95, "UI Design": 70, "Testing": 60 } },
  { name: "David Kim", skills: { "Documentation": 90, "Proposal": 95, "Project Management": 85, "Testing": 50 } },
  { name: "Alex Johnson", skills: { "Testing": 95, "QA": 95, "Automation": 85, "Documentation": 65 } },
];

export function AIDistribution() {
  const [isDistributing, setIsDistributing] = useState(false);

  const handleDistribute = () => {
    setIsDistributing(true);
    setTimeout(() => {
      setIsDistributing(false);
    }, 2500);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">AI Task Distribution</h1>
        <p className="text-muted-foreground">Intelligent task allocation powered by machine learning</p>
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
                  Analyzes skills, difficulty, effort, and availability to optimize task allocation
                </p>
              </div>
            </div>
            <Button 
              onClick={handleDistribute}
              disabled={isDistributing}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl shadow-lg px-8"
            >
              {isDistributing ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Running AI Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Run Distribution
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
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
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name.toLowerCase().replace(' ', '')}`} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
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
                        <div className="w-full bg-muted rounded-full h-2">
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
                <div key={idx} className="p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${run.balanced ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <p className="font-medium text-foreground">{run.date} at {run.time}</p>
                        <p className="text-sm text-muted-foreground">{run.tasks} tasks distributed</p>
                      </div>
                    </div>
                    <Badge variant={run.balanced ? "default" : "secondary"} className={run.balanced ? "bg-green-600" : ""}>
                      {run.balanced ? "Balanced" : "Rebalanced"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="algorithm" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Distribution Algorithm</CardTitle>
              <CardDescription>How SkillSync AI intelligently allocates tasks</CardDescription>
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
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-semibold text-cyan-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Difficulty Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      Evaluates task complexity and estimated effort to ensure fair distribution of challenging work
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-semibold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Workload Balancing</h4>
                    <p className="text-sm text-muted-foreground">
                      Considers current workload percentages and redistributes to maintain team balance within ±10%
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-semibold text-pink-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Continuous Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Learns from task completion times and outcomes to improve future distributions
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-indigo-900 mb-1">AI Learning</p>
                    <p className="text-sm text-indigo-700">
                      The algorithm improves over time by analyzing team performance patterns, task completion rates, and feedback to optimize future distributions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
