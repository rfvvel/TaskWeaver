import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { File, FileText, Image, FileCode, Download, Eye, MoreVertical, Search, Filter, FolderOpen, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

interface FileItem {
  id: number | string;
  name: string;
  type: string;
  size: string;
  owner: string;
  avatar: string;
  uploadDate: string;
  status: string;
  category: string;
  url: string; 
}

export function Files() {
  const { activeTeam, teams } = useOutletContext<{ activeTeam: string; teams: any[] }>();
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const currentTeam = teams?.find((t: any) => t.name === activeTeam);
      const groupId = currentTeam?.id || currentTeam?.group_id;
      
      if (!groupId) {
        setFiles([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("https://projecttaskweaverbackend-production.up.railway.app/api/getTaskFilesByGroup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group_id: groupId })
        });
        
        const json = await res.json();
        if (json.status === "sukses") {
          const mappedFiles = (json.data || []).map((dbFile: any) => ({
            id: dbFile.file_id,
            name: dbFile.file_name,
            type: dbFile.file_category || "document", 
            size: dbFile.file_size ? Number(dbFile.file_size) : 0,
            owner: dbFile.uploader_name || "Unknown User",
            avatar: dbFile.uploader_name || "U",
            uploadDate: new Date(dbFile.upload_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Uploaded",
            category: dbFile.file_category || "other",
            url: dbFile.file_url 
          }));
          
          setFiles(mappedFiles);
        }
      } catch (err) {
        console.error("Gagal menarik data file:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, [activeTeam, teams]);

  const handleDeleteFile = async (fileId: string | number, fileName: string) => {
    if (!window.confirm(`Apakah kamu yakin ingin menghapus file "${fileName}"?`)) return;

    try {
      const res = await fetch("https://projecttaskweaverbackend-production.up.railway.app/api/deleteTaskFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId })
      });
      
      const json = await res.json();
      if (json.status === "sukses") {
        setFiles(prev => prev.filter(f => f.id !== fileId));
      } else {
        alert("Gagal menghapus file: " + json.pesan);
      }
    } catch (err) {
      console.error("Gagal menghapus file:", err);
      alert("Terjadi kesalahan pada server saat menghapus file.");
    }
  };

  const handleDownload = (url: string) => {
    if (url) window.open(url, '_blank');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "design": return <File className="w-8 h-8 text-purple-600 dark:text-purple-400" />;
      case "document": return <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
      case "code": return <FileCode className="w-8 h-8 text-green-600 dark:text-green-400" />;
      case "image": return <Image className="w-8 h-8 text-pink-600 dark:text-pink-400" />;
      default: return <File className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getFileBackground = (type: string) => {
    switch (type) {
      case "design": return "bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/50";
      case "document": return "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50";
      case "code": return "bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50";
      case "image": return "bg-pink-50 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/50";
      default: return "bg-muted border-border";
    }
  };

  const filteredFiles = search.trim() ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : files;
  
  const totalFiles = files.length;
  const storageUsedMB = (files.length * 1.5).toFixed(1); 
  const categoriesCount = new Set(files.map(f => f.category)).size;

  const FileGrid = ({ data }: { data: FileItem[] }) => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <FolderOpen className="w-12 h-12 text-muted-foreground/60 mb-4" />
          <h3 className="font-semibold text-lg text-foreground mb-1">No files found</h3>
          <p className="text-sm text-muted-foreground">Submit a task or upload a file to see it here.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((file) => (
          <Card key={file.id} className="border-border shadow-sm hover:shadow-md transition-all group bg-card text-foreground">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className={`w-full h-32 rounded-xl border ${getFileBackground(file.type)} flex items-center justify-center`}>
                  {getFileIcon(file.type)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-foreground truncate flex-1" title={file.name}>
                      {file.name}
                    </h4>
                    
                    <DropdownMenu 
                      open={openDropdownId === file.id} 
                      onOpenChange={(open) => {
                        if (!open) setOpenDropdownId(null);
                        else setOpenDropdownId(file.id);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 bg-background hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="bg-popover border-border text-foreground shadow-lg z-50 min-w-[140px] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                        sideOffset={5}
                        avoidCollisions={true}
                      >
                        <DropdownMenuItem 
                          className="hover:bg-accent cursor-pointer focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file.url);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="hover:bg-accent cursor-pointer focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file.url);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id, file.name);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                    <Badge variant="secondary" className="text-[10px] font-normal capitalize bg-muted text-muted-foreground border-0">
                      {file.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                        {(file.owner || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
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
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-background text-foreground">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Files</h1>
        <p className="text-muted-foreground">Team file repository for <span className="font-semibold text-indigo-500">{activeTeam}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{totalFiles}</p>
            <p className="text-sm text-muted-foreground">Total Files</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{storageUsedMB} MB</p>
            <p className="text-sm text-muted-foreground">Storage Used</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{totalFiles}</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{categoriesCount}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search files..." 
            className="pl-10 rounded-xl bg-card border-border text-foreground" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted text-muted-foreground rounded-xl p-1">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">All Files</TabsTrigger>
          <TabsTrigger value="design" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">Design</TabsTrigger>
          <TabsTrigger value="document" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">Document</TabsTrigger>
          <TabsTrigger value="code" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <FileGrid data={filteredFiles} />
        </TabsContent>

        <TabsContent value="design">
          <FileGrid data={filteredFiles.filter(f => f.category?.toLowerCase() === "design" || f.type === "design" || f.type === "image")} />
        </TabsContent>

        <TabsContent value="document">
          <FileGrid data={filteredFiles.filter(f => f.category?.toLowerCase() === "document" || f.type === "document")} />
        </TabsContent>

        <TabsContent value="code">
          <FileGrid data={filteredFiles.filter(f => f.category?.toLowerCase() === "code" || f.type === "code")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}