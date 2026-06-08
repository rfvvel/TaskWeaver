import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock, User, Palette, Zap, Plus, X, Check,
  Code2, LogOut, Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

const SUGGESTED_CATEGORIES: { label: string; color: string }[] = [
  { label: "Frontend",           color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900" },
  { label: "Backend",            color: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900" },
  { label: "Database",           color: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900" },
  { label: "DevOps / Cloud",     color: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900" },
  { label: "Mobile",             color: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900" },
  { label: "AI / ML",            color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900" },
  { label: "UI/UX Design",       color: "bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900" },
  { label: "Testing / QA",       color: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900" },
  { label: "Graphic Design",     color: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900" },
  { label: "Photography",        color: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900" },
  { label: "Videography",        color: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900" },
  { label: "Music",              color: "bg-lime-100 dark:bg-lime-950/40 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-900" },
  { label: "Art / Illustration", color: "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900" },
  { label: "Writing",            color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900" },
  { label: "Content Creation",   color: "bg-fuchsia-100 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-900" },
  { label: "Project Management", color: "bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900" },
  { label: "Marketing",          color: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900" },
  { label: "Finance",            color: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900" },
  { label: "Sales",              color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900" },
  { label: "Legal",              color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
  { label: "HR / Recruiting",    color: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900" },
  { label: "Accounting",         color: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900" },
  { label: "Research / Analysis",color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900" },
  { label: "Education",          color: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900" },
  { label: "Medicine",           color: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900" },
  { label: "Psychology",         color: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900" },
  { label: "Environment",        color: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900" },
  { label: "Foreign Language",   color: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900" },
  { label: "Translation",        color: "bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900" },
  { label: "Public Speaking",    color: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900" },
  { label: "Sports",             color: "bg-lime-100 dark:bg-lime-950/40 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-900" },
  { label: "Health & Wellness",  color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900" },
  { label: "Culinary",           color: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900" },
  { label: "Soft Skill",         color: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900" },
  { label: "Other",              color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
];

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const PROFICIENCY_COLORS: Record<string, string> = {
  Beginner:     "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  Intermediate: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400",
  Advanced:     "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400",
  Expert:       "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400",
};

const FALLBACK_COLOR = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

function getCategoryColor(cat: string) {
  return SUGGESTED_CATEGORIES.find(c => c.label === cat)?.color ?? FALLBACK_COLOR;
}

type Skill = { id: string; name: string; category: string; level: string };

function skillsToString(skills: Skill[]): string {
  return JSON.stringify(skills);
}

function parseSkillsFromString(raw: string): Skill[] {
  if (!raw || !raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    return raw.split("|").filter(Boolean).map((entry, i) => {
      const parts = entry.split(",").map(s => s.trim());
      let name = parts[0] || "";
      let category = "Other";
      let level = "Beginner";
      if (parts.length > 3) {
         level = parts.pop() || "Beginner";
         category = parts.pop() || "Other";
         name = parts.join(", ");
      } else {
         name = parts[0] || "";
         category = parts[1] || "Other";
         level = parts[2] || "Beginner";
      }

      return { id: `s-${i}-${Date.now()}`, name, category, level };
    });
  }
}

function CategoryCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = value.trim()
    ? SUGGESTED_CATEGORIES.filter(c => c.label.toLowerCase().includes(value.toLowerCase()))
    : SUGGESTED_CATEGORIES;
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <Input value={value} onChange={e => { onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Type or pick a category…" className="rounded-lg h-9" />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          {filtered.map(c => (
            <button key={c.label} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2" onMouseDown={e => { e.preventDefault(); onChange(c.label); setOpen(false); }}>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${c.color}`}>{c.label}</span>
            </button>
          ))}
          {value.trim() && !SUGGESTED_CATEGORIES.some(c => c.label.toLowerCase() === value.toLowerCase()) && (
            <button type="button" className="w-full text-left px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-medium flex items-center gap-2" onMouseDown={e => { e.preventDefault(); setOpen(false); }}>
              <Plus className="w-3 h-3" /> Create category "{value}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Settings() {
  const navigate = useNavigate();

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  };
  const user = getUser();
  const userId = user.UserID || user.user_id || user.id;

  const [fullName,  setFullName]  = useState(user.UserFullName    || "");
  const [email,     setEmail]     = useState(user.UserEmail       || "");
  const [phone,     setPhone]     = useState(user.UserPhoneNumber || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const avatarInitials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join("") || "?";

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return;
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("https://projecttaskweaverbackend-production.up.railway.app/api/userUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, user_full_name: fullName, user_email: email, user_phone_number: phone }),
      });
      const result = await res.json();
      if (res.ok && result.status === "sukses") {
        const updated = { ...user, UserFullName: fullName, UserEmail: email, UserPhoneNumber: phone };
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("tw_user_updated"));
        setProfileMsg({ ok: true, text: "Profile updated successfully!" });
      } else {
        setProfileMsg({ ok: false, text: result.pesan || "Failed to update profile." });
      }
    } catch {
      setProfileMsg({ ok: false, text: "Cannot connect to server." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [skills,           setSkills]           = useState<Skill[]>([]);
  const [showAddSkill,     setShowAddSkill]     = useState(false);
  const [newSkillName,     setNewSkillName]     = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [newSkillLevel,    setNewSkillLevel]    = useState("Beginner");
  const [isSavingSkills,   setIsSavingSkills]   = useState(false);
  const [skillMsg,         setSkillMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetch("https://projecttaskweaverbackend-production.up.railway.app/api/userGetSkill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === "sukses") {
          const skillString = data.user_skill || (data.data && data.data.user_skill) || "";
          setSkills(parseSkillsFromString(skillString));
        }
      })
      .catch(() => {});
  }, [userId]);

  const persistSkills = async (updated: Skill[]) => {
    setSkills(updated);
    setIsSavingSkills(true);
    setSkillMsg(null);
    try {
      const res = await fetch("https://projecttaskweaverbackend-production.up.railway.app/api/userUISkill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, user_skill: skillsToString(updated) }),
      });
      const result = await res.json();
      if (res.ok && result.status === "sukses") {
        setSkillMsg({ ok: true, text: "Skills saved!" });
      } else {
        setSkillMsg({ ok: false, text: result.pesan || "Failed to save skills." });
      }
    } catch {
      setSkillMsg({ ok: false, text: "Cannot connect to server." });
    } finally {
      setIsSavingSkills(false);
      setTimeout(() => setSkillMsg(null), 3000);
    }
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const category = newSkillCategory.trim() || "Other";
    const updated = [...skills, { id: `s-${Date.now()}`, name: newSkillName.trim(), category, level: newSkillLevel }];
    persistSkills(updated);
    setNewSkillName(""); setNewSkillCategory(""); setNewSkillLevel("Beginner");
    setShowAddSkill(false);
  };

  const removeSkill = (id: string) => persistSkills(skills.filter(s => s.id !== id));

  const categoryOrder: string[] = [];
  skills.forEach(s => { if (!categoryOrder.includes(s.category)) categoryOrder.push(s.category); });
  const skillsByCategory: Record<string, Skill[]> = {};
  categoryOrder.forEach(cat => { skillsByCategory[cat] = skills.filter(s => s.category === cat); });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPwd,     setIsSavingPwd]     = useState(false);
  const [pwdMsg,          setPwdMsg]          = useState<{ ok: boolean; text: string } | null>(null);

  const handleUpdatePassword = async () => {
    setPwdMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMsg({ ok: false, text: "All password fields are required." }); return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ ok: false, text: "New password must be at least 6 characters." }); return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ ok: false, text: "New password and confirmation do not match." }); return;
    }
    setIsSavingPwd(true);
    try {
      const res = await fetch("https://projecttaskweaverbackend-production.up.railway.app/api/userUpdatePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, old_password: currentPassword, new_password: newPassword }),
      });
      const result = await res.json();
      if (res.ok && result.status === "sukses") {
        setPwdMsg({ ok: true, text: "Password updated successfully!" });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setPwdMsg({ ok: false, text: result.pesan || "Failed to update password." });
      }
    } catch {
      setPwdMsg({ ok: false, text: "Cannot connect to server." });
    } finally {
      setIsSavingPwd(false);
    }
  };

  const [isDark, setIsDark] = useState<boolean>(() =>
    localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const handleLayoutThemeChanged = () => {
      const currentTheme = localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark");
      setIsDark(currentTheme);
    };

    window.addEventListener("tw_theme_updated", handleLayoutThemeChanged);
    return () => window.removeEventListener("tw_theme_updated", handleLayoutThemeChanged);
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDark(dark);
    window.dispatchEvent(new Event("tw_theme_updated"));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("tw_activeTeam");
    navigate("/login");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted rounded-xl">
          <TabsTrigger value="profile"    className="rounded-lg gap-2"><User    className="w-4 h-4" />Profile</TabsTrigger>
          <TabsTrigger value="skills"     className="rounded-lg gap-2"><Zap     className="w-4 h-4" />Skills</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg gap-2"><Palette className="w-4 h-4" />Appearance</TabsTrigger>
          <TabsTrigger value="security"   className="rounded-lg gap-2"><Lock    className="w-4 h-4" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-2xl font-bold">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="rounded-xl" placeholder="e.g. Rafael Vvel" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+62 81234567" className="rounded-xl" />
              </div>

              {profileMsg && (
                <p className={`text-sm font-medium ${profileMsg.ok ? "text-green-600" : "text-red-500"}`}>
                  {profileMsg.ok ? "✓" : "⚠"} {profileMsg.text}
                </p>
              )}

              <div className="flex justify-between items-center w-full mt-4">
                <div className="flex gap-3">
                  <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl">
                    {isSavingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => {
                    const u = getUser();
                    setFullName(u.UserFullName || ""); setEmail(u.UserEmail || ""); setPhone(u.UserPhoneNumber || "");
                    setProfileMsg(null);
                  }}>Cancel</Button>
                </div>
                <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    My Skills
                  </CardTitle>
                  <CardDescription>Add any skill — technical, creative, language, sports, etc.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isSavingSkills && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                  {skillMsg && <span className={`text-xs font-medium ${skillMsg.ok ? "text-green-600" : "text-red-500"}`}>{skillMsg.text}</span>}
                  <Button onClick={() => setShowAddSkill(v => !v)} className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl gap-2">
                    <Plus className="w-4 h-4" /> Add Skill
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {showAddSkill && (
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-indigo-900 dark:text-indigo-200">New Skill</p>
                    <button onClick={() => setShowAddSkill(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Skill Name</Label>
                      <Input value={newSkillName} onChange={e => setNewSkillName(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="e.g. Photography, Python, Guitar…" className="rounded-lg h-9" autoFocus />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <CategoryCombobox value={newSkillCategory} onChange={setNewSkillCategory} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Proficiency Level</Label>
                      <div className="flex gap-1 flex-wrap">
                        {PROFICIENCY_LEVELS.map(l => (
                          <button key={l} type="button" onClick={() => setNewSkillLevel(l)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${newSkillLevel === l ? `${PROFICIENCY_COLORS[l]} border-current font-semibold ring-2 ring-indigo-300 dark:ring-indigo-800` : "bg-background border-border text-muted-foreground hover:border-indigo-300 dark:hover:border-indigo-800"}`}
                          >{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button onClick={addSkill} disabled={!newSkillName.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-2 h-9">
                    <Check className="w-4 h-4" /> Confirm
                  </Button>
                </div>
              )}

              {Object.keys(skillsByCategory).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  <p className="text-sm">No skills yet — add your first one!</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {catSkills.map(skill => (
                          <div key={skill.id} className={`flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full border text-sm font-medium ${getCategoryColor(skill.category)}`}>
                            <span>{skill.name}</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-normal ${PROFICIENCY_COLORS[skill.level] ?? "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>{skill.level}</span>
                            <button onClick={() => removeSkill(skill.id)} className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how TaskWeaver AI looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => applyTheme(false)} className={`p-4 rounded-xl border-2 transition-all text-left ${!isDark ? "border-indigo-500 bg-gradient-to-r from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/20 dark:to-cyan-950/20" : "border-border hover:border-indigo-200"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm" />
                      <div className="flex-1"><p className="font-medium text-sm text-foreground">Light</p><p className="text-xs text-muted-foreground">{!isDark ? "Active" : "Click to apply"}</p></div>
                      {!isDark && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  </button>
                  <button onClick={() => applyTheme(true)} className={`p-4 rounded-xl border-2 transition-all text-left ${isDark ? "border-indigo-500 bg-slate-900" : "border-border hover:border-slate-400"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700" />
                      <div className="flex-1"><p className="font-medium text-sm text-foreground">Dark</p><p className="text-xs text-muted-foreground">{isDark ? "Active" : "Click to apply"}</p></div>
                      {isDark && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" className="rounded-xl" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter your current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" className="rounded-xl" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" className="rounded-xl" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
              </div>

              {pwdMsg && (
                <p className={`text-sm font-medium ${pwdMsg.ok ? "text-green-600" : "text-red-500"}`}>
                  {pwdMsg.ok ? "✓" : "⚠"} {pwdMsg.text}
                </p>
              )}

              <Button onClick={handleUpdatePassword} disabled={isSavingPwd} className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl">
                {isSavingPwd ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}