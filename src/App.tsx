import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import { Layout } from './components/layout/Layout'; 
import { Dashboard } from './pages/dashboard/Dashboard';
import { MyTasks } from './pages/mytask/MyTask';
import { AIDistribution } from './pages/ai_distribution/AIDistribution'
import { Calendar  } from './pages/calender/Calender'

import { Chat } from './pages/chat/Chat';
import { Files } from './pages/files/Files';
import { Settings } from './pages/settings/Settings'
import { TeamActivity } from './pages/teamActivity/TeamActivity';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center">
    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h1 className="text-2xl font-bold text-slate-900 mb-2">Halaman {title}</h1>
    <p className="text-slate-500">Halaman ini sedang dalam tahap pengembangan oleh tim.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<MyTasks />} />
          <Route path="/ai-distribution" element={<AIDistribution />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/activity" element={<TeamActivity />} />
          <Route path="/files" element={<Files />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
