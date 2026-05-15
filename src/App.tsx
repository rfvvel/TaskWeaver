import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { Team } from './pages/auth/Team';

import { Layout } from './components/layout/Layout'; 
import { Dashboard } from './pages/dashboard/Dashboard';
import { MyTasks } from './pages/myTask/MyTask';
import { AIDistribution } from './pages/aiDistribution/AiDistribution';
import { Calendar  } from './pages/calender/Calender'
import { TeamActivity } from './pages/teamActivity/TeamActivity';
import { Files } from './pages/files/Files';
import { Chat } from './pages/chat/Chat';
import { Settings } from './pages/settings/Settings'
import { TaskManagement } from './pages/taskManagement/TaskManagement';
import { TeamManagement } from './pages/teamManagement/TeamManagement';


function App() {
  return (
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
          <Route path="/task-management" element={<TaskManagement/>} />
          <Route path="/team-management" element={<TeamManagement/>} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
