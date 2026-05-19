import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Lock, User, Palette, Zap, Plus, X, Check,
  Code2, BookOpen, Star, Globe, Brain, Briefcase, LogOut
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

// ─── Skill Config ─────────────────────────────────────────────────────────────

/**
 * Preset category suggestions — user can pick one OR type anything custom.
 * Each entry has a color palette for the badge.
 */
const SUGGESTED_CATEGORIES: { label: string; color: string }[] = [
  // Tech
  { label: "Frontend",           color: "bg-blue-100   text-blue-700   border-blue-200" },
  { label: "Backend",            color: "bg-green-100  text-green-700  border-green-200" },
  { label: "Database",           color: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "DevOps / Cloud",     color: "bg-purple-100 text-purple-700 border-purple-200" },
  { label: "Mobile",             color: "bg-cyan-100   text-cyan-700   border-cyan-200" },
  { label: "AI / ML",            color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { label: "UI/UX Design",       color: "bg-pink-100   text-pink-700   border-pink-200" },
  { label: "Testing / QA",       color: "bg-red-100    text-red-700    border-red-200" },
  // Creative
  { label: "Graphic Design",     color: "bg-rose-100   text-rose-700   border-rose-200" },
  { label: "Photography",        color: "bg-amber-100  text-amber-700  border-amber-200" },
  { label: "Videography",        color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { label: "Music",              color: "bg-lime-100   text-lime-700   border-lime-200" },
  { label: "Art / Illustration", color: "bg-teal-100   text-teal-700   border-teal-200" },
  { label: "Writing",            color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "Content Creation",   color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
  // Business & Management
  { label: "Project Management", color: "bg-sky-100    text-sky-700    border-sky-200" },
  { label: "Marketing",          color: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Finance",            color: "bg-green-100  text-green-700  border-green-200" },
  { label: "Sales",              color: "bg-blue-100   text-blue-700   border-blue-200" },
  { label: "Legal",              color: "bg-slate-100  text-slate-700  border-slate-200" },
  { label: "HR / Recruiting",    color: "bg-violet-100 text-violet-700 border-violet-200" },
  { label: "Accounting",         color: "bg-cyan-100   text-cyan-700   border-cyan-200" },
  // Science & Education
  { label: "Research / Analysis",color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { label: "Education",          color: "bg-amber-100  text-amber-700  border-amber-200" },
  { label: "Medicine",           color: "bg-red-100    text-red-700    border-red-200" },
  { label: "Psychology",         color: "bg-purple-100 text-purple-700 border-purple-200" },
  { label: "Environment",        color: "bg-green-100  text-green-700  border-green-200" },
  // Language & Communication
  { label: "Foreign Language",   color: "bg-rose-100   text-rose-700   border-rose-200" },
  { label: "Translation",        color: "bg-pink-100   text-pink-700   border-pink-200" },
  { label: "Public Speaking",    color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  // Sports & Lifestyle
  { label: "Sports",             color: "bg-lime-100   text-lime-700   border-lime-200" },
  { label: "Health & Wellness",  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "Culinary",           color: "bg-orange-100 text-orange-700 border-orange-200" },
  // General
  { label: "Soft Skill",         color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { label: "Other",              color: "bg-slate-100  text-slate-700  border-slate-200" },
];

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const PROFICIENCY_COLORS: Record<string, string> = {
  Beginner:     "bg-slate-100  text-slate-600",
  Intermediate: "bg-blue-100   text-blue-700",
  Advanced:     "bg-indigo-100 text-indigo-700",
  Expert:       "bg-purple-100 text-purple-700",
};

/** Fallback color for custom (unknown) categories */
const FALLBACK_COLOR = "bg-slate-100 text-slate-700 border-slate-200";

function getCategoryColor(cat: string) {
  return SUGGESTED_CATEGORIES.find(c => c.label === cat)?.color ?? FALLBACK_COLOR;
}

type Skill = { id: string; name: string; category: string; level: string };

type WorkPrefs = {
  availableHoursPerWeek: number;
  [key: string]: boolean | number;
};

/** Generic task preference items — not CS-specific */
const TASK_PREF_OPTIONS = [
  { key: "preferResearch",       label: "Research & Analysis",          desc: "Gathering data, making reports, analysis" },
  { key: "preferDesign",         label: "Design & Creative",            desc: "Visual design, content, illustration" },
  { key: "preferWriting",        label: "Writing & Documentation",      desc: "Articles, reports, technical documentation" },
  { key: "preferCoding",         label: "Programming / Technical",      desc: "Coding, debugging, system architecture" },
  { key: "preferCommunication",  label: "Communication & Coordination", desc: "Meetings, presentations, team mediation" },
  { key: "preferTesting",        label: "Testing & QA",                 desc: "Testing, reviews, quality control" },
  { key: "preferMarketing",      label: "Marketing & Promotion",        desc: "Social media, ads, copywriting" },
  { key: "preferOperations",     label: "Operations & Logistics",       desc: "Task management, scheduling, resource coordination" },
];

const defaultSkills: Skill[] = [];

const defaultWorkPrefs: WorkPrefs = {
  availableHoursPerWeek: 20,
  preferResearch: true,
  preferDesign: false,
  preferWriting: true,
  preferCoding: true,
  preferCommunication: true,
  preferTesting: false,
  preferMarketing: false,
  preferOperations: false,
};

// ─── Combobox for category input ─────────────────────────────────────────────
function CategoryCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? SUGGESTED_CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(value.toLowerCase())
      )
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
      <Input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Type or pick a category…"
        className="rounded-lg h-9"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
          {filtered.map(c => (
            <button
              key={c.label}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
              onMouseDown={e => { e.preventDefault(); onChange(c.label); setOpen(false); }}
            >
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${c.color}`}>{c.label}</span>
            </button>
          ))}
          {/* Allow confirming a fully custom value not in list */}
          {value.trim() && !SUGGESTED_CATEGORIES.some(c => c.label.toLowerCase() === value.toLowerCase()) && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium flex items-center gap-2"
              onMouseDown={e => { e.preventDefault(); setOpen(false); }}
            >
              <Plus className="w-3 h-3" /> Create category "{value}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function Settings() {
  const navigate = useNavigate();

  // --- Profile ---
  const [firstName, setFirstName] = useState("Rafael");
  const [lastName,  setLastName]  = useState("Vvel");
  const [email,     setEmail]     = useState("rafaelvvel@binus.ac.id");
  const [phone,     setPhone]     = useState("");

  const avatarInitials =
    `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "?";

  // --- Logout Handler ---
  const handleLogout = () => {
    // Menghapus data sesi user jika ada
    localStorage.removeItem("user");
    localStorage.removeItem("tw_activeTeam");
    // Lempar kembali ke halaman login
    navigate("/login");
  };

  // --- Dark Mode ---
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem("tw_theme") === "dark" ||
      document.documentElement.classList.contains("dark")
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tw_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tw_theme", "light");
    }
  }, [isDark]);

  // --- Skills ---
  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem("tw_user_skills");
      return saved ? JSON.parse(saved) : defaultSkills;
    } catch { return defaultSkills; }
  });

  const [showAddSkill,     setShowAddSkill]     = useState(false);
  const [newSkillName,     setNewSkillName]      = useState("");
  const [newSkillCategory, setNewSkillCategory]  = useState("");
  const [newSkillLevel,    setNewSkillLevel]     = useState("Beginner");

  const saveSkills = (updated: Skill[]) => {
    setSkills(updated);
    localStorage.setItem("tw_user_skills", JSON.stringify(updated));
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const category = newSkillCategory.trim() || "Other";
    saveSkills([
      ...skills,
      { id: `s-${Date.now()}`, name: newSkillName.trim(), category, level: newSkillLevel },
    ]);
    setNewSkillName("");
    setNewSkillCategory("");
    setNewSkillLevel("Beginner");
    setShowAddSkill(false);
  };

  const removeSkill = (id: string) => saveSkills(skills.filter(s => s.id !== id));

  // Group by category (preserving insertion order, not a fixed list)
  const categoryOrder: string[] = [];
  skills.forEach(s => { if (!categoryOrder.includes(s.category)) categoryOrder.push(s.category); });
  const skillsByCategory: Record<string, Skill[]> = {};
  categoryOrder.forEach(cat => { skillsByCategory[cat] = skills.filter(s => s.category === cat); });

  // --- Learning Goals ---
  const [learningGoals, setLearningGoals] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tw_learning_goals");
      return saved ? JSON.parse(saved) : ["Learn Docker", "Improve public speaking"];
    } catch { return []; }
  });
  const [newGoal, setNewGoal] = useState("");

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const updated = [...learningGoals, newGoal.trim()];
    setLearningGoals(updated);
    localStorage.setItem("tw_learning_goals", JSON.stringify(updated));
    setNewGoal("");
  };

  const removeGoal = (idx: number) => {
    const updated = learningGoals.filter((_, i) => i !== idx);
    setLearningGoals(updated);
    localStorage.setItem("tw_learning_goals", JSON.stringify(updated));
  };

  // --- Role & Work Prefs ---
  const [preferredRole, setPreferredRole] = useState(() =>
    localStorage.getItem("tw_preferred_role") || "Full Stack Developer"
  );

  const [workPrefs, setWorkPrefs] = useState<WorkPrefs>(() => {
    try {
      const saved = localStorage.getItem("tw_work_prefs");
      return saved ? JSON.parse(saved) : defaultWorkPrefs;
    } catch { return defaultWorkPrefs; }
  });

  const updateWorkPref = (key: string, value: boolean | number) => {
    const updated = { ...workPrefs, [key]: value };
    setWorkPrefs(updated);
    localStorage.setItem("tw_work_prefs", JSON.stringify(updated));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted rounded-xl">
          <TabsTrigger value="profile"       className="rounded-lg gap-2"><User    className="w-4 h-4" />Profile</TabsTrigger>
          <TabsTrigger value="skills"        className="rounded-lg gap-2"><Zap     className="w-4 h-4" />Skills</TabsTrigger>
          <TabsTrigger value="appearance"    className="rounded-lg gap-2"><Palette className="w-4 h-4" />Appearance</TabsTrigger>
          <TabsTrigger value="security"      className="rounded-lg gap-2"><Lock    className="w-4 h-4" />Security</TabsTrigger>
        </TabsList>

        {/* ══════════════════════ PROFILE ══════════════════════ */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-2xl font-bold">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" className="rounded-xl">Change Photo</Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+62 81234567" className="rounded-xl" />
              </div>
              
              <div className="flex justify-between items-center w-full mt-4">
                <div className="flex gap-3">
                  <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl">
                    Save Changes
                  </Button>
                  <Button variant="outline" className="rounded-xl">Cancel</Button>
                </div>
                <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════ SKILLS ══════════════════════ */}
        <TabsContent value="skills" className="space-y-6">

          {/* Skills list */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-600" />
                    My Skills
                  </CardTitle>
                  <CardDescription>
                    Add any skill — technical, creative, language, sports, etc.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAddSkill(v => !v)}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Add skill inline form */}
              {showAddSkill && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-indigo-900">New Skill</p>
                    <button onClick={() => setShowAddSkill(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Skill name — free text */}
                    <div className="space-y-1">
                      <Label className="text-xs">Skill Name</Label>
                      <Input
                        value={newSkillName}
                        onChange={e => setNewSkillName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addSkill()}
                        placeholder="e.g. Photography, Python, Guitar…"
                        className="rounded-lg h-9"
                        autoFocus
                      />
                    </div>

                    {/* Category — combobox (type anything OR pick suggestion) */}
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Category
                        <span className="ml-1 text-muted-foreground font-normal">(can be custom)</span>
                      </Label>
                      <CategoryCombobox value={newSkillCategory} onChange={setNewSkillCategory} />
                    </div>

                    {/* Proficiency */}
                    <div className="space-y-1">
                      <Label className="text-xs">Proficiency Level</Label>
                      <div className="flex gap-1 flex-wrap">
                        {PROFICIENCY_LEVELS.map(l => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setNewSkillLevel(l)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              newSkillLevel === l
                                ? `${PROFICIENCY_COLORS[l]} border-current font-semibold ring-2 ring-indigo-300`
                                : "bg-white border-border text-muted-foreground hover:border-indigo-300"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={addSkill}
                    disabled={!newSkillName.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-2 h-9"
                  >
                    <Check className="w-4 h-4" /> Confirm
                  </Button>
                </div>
              )}

              {/* Skills grouped by category */}
              {Object.keys(skillsByCategory).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  <p className="text-sm">No skills yet — add your first one!</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {catSkills.map(skill => (
                          <div
                            key={skill.id}
                            className={`flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full border text-sm font-medium ${getCategoryColor(skill.category)}`}
                          >
                            <span>{skill.name}</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-normal ${PROFICIENCY_COLORS[skill.level] ?? "bg-slate-100 text-slate-600"}`}>
                              {skill.level}
                            </span>
                            <button
                              onClick={() => removeSkill(skill.id)}
                              className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Visibility */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Skill Visibility
              </CardTitle>
              <CardDescription>Control what your teammates can see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Show skills to team members", desc: "Team members can view your full skill profile",                                      defaultOn: true },
                { label: "Show proficiency levels",      desc: "Display proficiency levels alongside skill names",                                 defaultOn: true },
              ].map((item, idx, arr) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultOn} />
                  </div>
                  {idx < arr.length - 1 && <Separator className="mt-5" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════ APPEARANCE ══════════════════════ */}
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
                  <button
                    onClick={() => setIsDark(false)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      !isDark ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-cyan-50" : "border-border hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Light</p>
                        <p className="text-xs text-muted-foreground">{!isDark ? "Active" : "Click to apply"}</p>
                      </div>
                      {!isDark && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  </button>
                  <button
                    onClick={() => setIsDark(true)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isDark ? "border-indigo-500 bg-slate-800" : "border-border hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600" />
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${isDark ? "text-slate-100" : ""}`}>Dark</p>
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>
                          {isDark ? "Active" : "Click to apply"}
                        </p>
                      </div>
                      {isDark && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════ SECURITY ══════════════════════ */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" className="rounded-xl" />
              </div>
              <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}