import { useState } from "react";
import { CheckCircle2, Circle, Clock, Flag, Search, Filter } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const tasks = [
  { 
    id: 1, 
    title: "Design authentication flow UI", 
    status: "in-progress", 
    priority: "high", 
    deadline: "Feb 16, 2026",
    estimatedHours: 8,
    completed: false,
    category: "UI Design"
  },
  { 
    id: 2, 
    title: "Create user profile components", 
    status: "todo", 
    priority: "medium", 
    deadline: "Feb 18, 2026",
    estimatedHours: 6,
    completed: false,
    category: "Frontend"
  },
  { 
    id: 3, 
    title: "Review API documentation", 
    status: "in-progress", 
    priority: "high", 
    deadline: "Feb 16, 2026",
    estimatedHours: 4,
    completed: false,
    category: "Documentation"
  },
  { 
    id: 4, 
    title: "Set up testing environment", 
    status: "completed", 
    priority: "low", 
    deadline: "Feb 14, 2026",
    estimatedHours: 3,
    completed: true,
    category: "Testing"
  },
  { 
    id: 5, 
    title: "Update project proposal", 
    status: "todo", 
    priority: "medium", 
    deadline: "Feb 20, 2026",
    estimatedHours: 5,
    completed: false,
    category: "Documentation"
  },
];

export function MyTasks() {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const toggleTask = (id: number) => {
    setSelectedTasks(prev => 
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-50 text-red-700 border-red-200",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
      low: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return colors[priority as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "in-progress") return <Clock className="w-5 h-5 text-blue-600" />;
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  const filterTasks = (status?: string) => {
    if (!status) return tasks;
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">My Tasks</h1>
        <p className="text-muted-foreground">Manage and track your assigned tasks</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">5</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600">2</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">1</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-orange-600">26h</p>
              <p className="text-sm text-muted-foreground">Est. Hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-10 rounded-xl" />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Filter className="w-4 h-4" />
          Filter
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

        <TabsContent value="all" className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className={`border-border shadow-sm hover:shadow-md transition-shadow ${task.completed ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox 
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  {getStatusIcon(task.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Flag className="w-4 h-4" />
                        {task.deadline}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="todo" className="space-y-3">
          {filterTasks("todo").map(task => (
            <Card key={task.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox />
                  {getStatusIcon(task.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Flag className="w-4 h-4" />
                        {task.deadline}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-3">
          {filterTasks("in-progress").map(task => (
            <Card key={task.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox />
                  {getStatusIcon(task.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Flag className="w-4 h-4" />
                        {task.deadline}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {filterTasks("completed").map(task => (
            <Card key={task.id} className="border-border shadow-sm opacity-60">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox checked disabled />
                  {getStatusIcon(task.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Flag className="w-4 h-4" />
                        {task.deadline}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
