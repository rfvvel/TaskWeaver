import { useState } from "react";
import { File, FileText, Image, FileCode, Download, Eye, MoreVertical, Search, Upload, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const files = [
  {
    id: 1,
    name: "authentication-flow-mockup.fig",
    type: "design",
    size: "2.4 MB",
    owner: "Sarah Chen",
    avatar: "sarah",
    uploadDate: "Feb 13, 2026",
    status: "final",
    category: "Design"
  },
  {
    id: 2,
    name: "API-documentation.pdf",
    type: "document",
    size: "1.8 MB",
    owner: "Michael Rodriguez",
    avatar: "michael",
    uploadDate: "Feb 12, 2026",
    status: "reviewed",
    category: "Documentation"
  },
  {
    id: 3,
    name: "test-results-final.pdf",
    type: "document",
    size: "856 KB",
    owner: "Alex Johnson",
    avatar: "alex",
    uploadDate: "Feb 14, 2026",
    status: "final",
    category: "Testing"
  },
  {
    id: 4,
    name: "component-library.tsx",
    type: "code",
    size: "124 KB",
    owner: "Emily Watson",
    avatar: "emily",
    uploadDate: "Feb 11, 2026",
    status: "draft",
    category: "Development"
  },
  {
    id: 5,
    name: "project-proposal-v3.docx",
    type: "document",
    size: "456 KB",
    owner: "David Kim",
    avatar: "david",
    uploadDate: "Feb 10, 2026",
    status: "reviewed",
    category: "Documentation"
  },
  {
    id: 6,
    name: "user-flow-diagram.png",
    type: "image",
    size: "3.2 MB",
    owner: "Sarah Chen",
    avatar: "sarah",
    uploadDate: "Feb 9, 2026",
    status: "final",
    category: "Design"
  },
];

export function Files() {
  const [view, setView] = useState<"grid" | "list">("grid");

  const getFileIcon = (type: string) => {
    switch (type) {
      case "design":
        return <File className="w-8 h-8 text-purple-600" />;
      case "document":
        return <FileText className="w-8 h-8 text-blue-600" />;
      case "code":
        return <FileCode className="w-8 h-8 text-green-600" />;
      case "image":
        return <Image className="w-8 h-8 text-pink-600" />;
      default:
        return <File className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>,
      reviewed: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reviewed</Badge>,
      final: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Final</Badge>,
    };
    return variants[status as keyof typeof variants];
  };

  const getFileBackground = (type: string) => {
    switch (type) {
      case "design":
        return "bg-purple-50 border-purple-100";
      case "document":
        return "bg-blue-50 border-blue-100";
      case "code":
        return "bg-green-50 border-green-100";
      case "image":
        return "bg-pink-50 border-pink-100";
      default:
        return "bg-muted border-border";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Files</h1>
        <p className="text-muted-foreground">Team file repository and document management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">124</p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-indigo-600">8.4 GB</p>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">23</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-purple-600">5</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search files..." className="pl-10 rounded-xl" />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl">
          <Upload className="w-4 h-4" />
          Upload File
        </Button>
      </div>

      {/* Files Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted rounded-xl">
          <TabsTrigger value="all" className="rounded-lg">All Files</TabsTrigger>
          <TabsTrigger value="design" className="rounded-lg">Design</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg">Documents</TabsTrigger>
          <TabsTrigger value="code" className="rounded-lg">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="border-border shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* File Icon */}
                    <div className={`w-full h-32 rounded-xl border ${getFileBackground(file.type)} flex items-center justify-center`}>
                      {getFileIcon(file.type)}
                    </div>

                    {/* File Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm text-foreground truncate flex-1">
                          {file.name}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{file.size}</span>
                        {getStatusBadge(file.status)}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${file.avatar}`} />
                          <AvatarFallback className="text-xs">{file.owner.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{file.owner}</p>
                          <p className="text-[10px] text-muted-foreground">{file.uploadDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="design">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.filter(f => f.type === "design" || f.type === "image").map((file) => (
              <Card key={file.id} className="border-border shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className={`w-full h-32 rounded-xl border ${getFileBackground(file.type)} flex items-center justify-center`}>
                      {getFileIcon(file.type)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm text-foreground truncate flex-1">
                          {file.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{file.size}</span>
                        {getStatusBadge(file.status)}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${file.avatar}`} />
                          <AvatarFallback className="text-xs">{file.owner.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{file.owner}</p>
                          <p className="text-[10px] text-muted-foreground">{file.uploadDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.filter(f => f.type === "document").map((file) => (
              <Card key={file.id} className="border-border shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className={`w-full h-32 rounded-xl border ${getFileBackground(file.type)} flex items-center justify-center`}>
                      {getFileIcon(file.type)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm text-foreground truncate flex-1">
                          {file.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{file.size}</span>
                        {getStatusBadge(file.status)}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${file.avatar}`} />
                          <AvatarFallback className="text-xs">{file.owner.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{file.owner}</p>
                          <p className="text-[10px] text-muted-foreground">{file.uploadDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.filter(f => f.type === "code").map((file) => (
              <Card key={file.id} className="border-border shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className={`w-full h-32 rounded-xl border ${getFileBackground(file.type)} flex items-center justify-center`}>
                      {getFileIcon(file.type)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm text-foreground truncate flex-1">
                          {file.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{file.size}</span>
                        {getStatusBadge(file.status)}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${file.avatar}`} />
                          <AvatarFallback className="text-xs">{file.owner.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{file.owner}</p>
                          <p className="text-[10px] text-muted-foreground">{file.uploadDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
