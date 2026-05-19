import { useState, useEffect } from "react";
import { File, FileText, Image, FileCode, Download, Eye, MoreVertical, Search, Filter, FolderOpen, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
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
}

export function Files() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [search, setSearch] = useState("");

  // Mengambil data dari localStorage saat halaman diload
  useEffect(() => {
    const fetchFiles = () => {
      const stored = localStorage.getItem("tw_files");
      if (stored) {
        setFiles(JSON.parse(stored));
      }
    };
    fetchFiles();

    window.addEventListener("storage", fetchFiles);
    return () => window.removeEventListener("storage", fetchFiles);
  }, []);

  // Fungsi untuk MENGHAPUS SEMUA FILE
  const handleDeleteAll = () => {
    if (window.confirm("Apakah kamu yakin ingin menghapus semua file? Aksi ini tidak bisa dibatalkan.")) {
      localStorage.removeItem("tw_files");
      setFiles([]); // Kosongkan state langsung
    }
  };

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
    return variants[status as keyof typeof variants] || <Badge variant="outline" className="bg-slate-50">{status}</Badge>;
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

  // Dinamis Filter & Stats
  const filteredFiles = search.trim() ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : files;
  
  const totalFiles = files.length;
  const storageUsedMB = (files.length * 1.5).toFixed(1); 
  const categoriesCount = new Set(files.map(f => f.category)).size;

  // Komponen Helper untuk render grid
  const FileGrid = ({ data }: { data: FileItem[] }) => {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="font-semibold text-lg text-slate-900 mb-1">No files found</h3>
          <p className="text-sm text-slate-500">Submit a task or upload a file to see it here.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((file) => (
          <Card key={file.id} className="border-border shadow-sm hover:shadow-md transition-all group bg-white">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Preview</DropdownMenuItem>
                        <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Download</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                    <Badge variant="secondary" className="text-[10px] font-normal capitalize">{file.category}</Badge>
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
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Files</h1>
        <p className="text-muted-foreground">Team file repository and document management</p>
      </div>

      {/* Stats Dinamis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{totalFiles}</p>
            <p className="text-sm text-muted-foreground">Total Files</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-indigo-600">{storageUsedMB} MB</p>
            <p className="text-sm text-muted-foreground">Storage Used</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">{totalFiles}</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-purple-600">{categoriesCount}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search files..." 
            className="pl-10 rounded-xl bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl bg-white">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        {/* TOMBOL DELETE ALL */}
        <Button 
          onClick={handleDeleteAll}
          className="gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      {/* TABS KATEGORI */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="all" className="rounded-lg">All Files</TabsTrigger>
          <TabsTrigger value="design" className="rounded-lg">Design</TabsTrigger>
          <TabsTrigger value="document" className="rounded-lg">Document</TabsTrigger>
          <TabsTrigger value="code" className="rounded-lg">Code</TabsTrigger>
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