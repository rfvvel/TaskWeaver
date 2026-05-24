import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { Team } from './pages/auth/Team';

import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { MyTasks } from './pages/myTask/MyTask';
import { AIDistribution } from './pages/aiDistribution/AiDistribution';
import { Calendar } from './pages/calender/Calender';
import { TeamActivity } from './pages/teamActivity/TeamActivity';
import { Files } from './pages/files/Files';
import { Chat } from './pages/chat/Chat';
import { Settings } from './pages/settings/Settings';
import { TaskManagement } from './pages/taskManagement/TaskManagement';
import { TeamManagement } from './pages/teamManagement/TeamManagement';

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index === text.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <h1 className="text-6xl md:text-8xl font-black tracking-[0.15em] text-white">
      {displayedText}
      <span className="animate-pulse text-cyan-300">|</span>
    </h1>
  );
}

function SplashScreen() {
  // ✅ CARA INISIALISASI ORIGINAL TEMANMU
  const particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        background: 'radial-gradient(circle at top, #1e3a8a 0%, #0f172a 45%, #020617 100%)',
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0"
        options={{
          background: { color: 'transparent' },
          fpsLimit: 60,
          particles: {
            color: { value: '#60a5fa' },
            links: { color: '#3b82f6', distance: 150, enable: true, opacity: 0.25, width: 1 },
            move: { enable: true, speed: 1 },
            number: { value: 65 },
            opacity: { value: 0.6 },
            size: { value: { min: 1, max: 4 } },
          },
        }}
      />

      <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} className="drop-shadow-[0_0_35px_rgba(59,130,246,0.9)]">
          <TypewriterText text="TaskWeaver" />
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 1 }} className="mt-6 text-sm md:text-base tracking-[0.4em] text-blue-200">
          Maximize the division of labor
        </motion.p>
        <motion.div initial={{ width: 0 }} animate={{ width: 220 }} transition={{ delay: 2.2, duration: 1 }} className="mt-8 h-[3px] rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500" />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} className="mt-4 text-xs tracking-[0.5em] text-blue-400">
          LOADING...
        </motion.p>
      </div>
    </motion.div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <SplashScreen />}</AnimatePresence>
      {!loading && (
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Team />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<MyTasks />} />
              <Route path="/ai-distribution" element={<AIDistribution />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/activity" element={<TeamActivity />} />
              <Route path="/files" element={<Files />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/task-management" element={<TaskManagement />} />
              <Route path="/team-management" element={<TeamManagement />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/" element={<Navigate to="/register" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;