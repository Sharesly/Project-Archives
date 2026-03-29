/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { APP_CONFIG, PROJECT_STATUSES, PRIORITY_LEVELS } from './config';
import { ToastProvider, useToast } from './components/Toast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import KanbanView from './views/KanbanView';
import PriorityView from './views/PriorityView';
import PortfolioView from './views/PortfolioView';
import RecordView from './views/RecordView';
import PublicView from './views/PublicView';
import LoginView from './views/LoginView';
import { api } from './lib/api';

function InternalApp() {
  const [currentView, setCurrentView] = useState('kanban');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const handleProjectClick = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('record');
  };

  const handleNewProject = async () => {
    if (!newProjectTitle.trim()) return;
    try {
      await api.createProject({
        title: newProjectTitle,
        description: '',
        status: PROJECT_STATUSES[0],
        priority: PRIORITY_LEVELS[1],
        owner: {
          name: auth.currentUser?.displayName || 'Current User',
          initials: auth.currentUser?.displayName?.substring(0, 2).toUpperCase() || 'CU',
          avatar: auth.currentUser?.photoURL || ''
        },
        tags: [],
        progress: 0,
        department: 'General',
        riskFactor: 'Low',
        healthScore: 0
      });
      setIsNewProjectModalOpen(false);
      setNewProjectTitle('');
      setRefreshTrigger(prev => prev + 1);
      setCurrentView('kanban');
      showToast(`${APP_CONFIG.projectLabel} created successfully`, 'success');
    } catch (error) {
      showToast(`Failed to create ${APP_CONFIG.projectLabel.toLowerCase()}`, 'error');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'kanban':
        return <KanbanView onProjectClick={handleProjectClick} onNewProject={() => setIsNewProjectModalOpen(true)} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />;
      case 'priority':
        return <PriorityView onProjectClick={handleProjectClick} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />;
      case 'portfolio':
        return <PortfolioView onProjectClick={handleProjectClick} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />;
      case 'record':
        return <RecordView projectId={selectedProjectId} onBack={() => { setCurrentView('kanban'); setRefreshTrigger(prev => prev + 1); }} />;
      default:
        return <KanbanView onProjectClick={handleProjectClick} onNewProject={() => setIsNewProjectModalOpen(true)} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-surface font-body">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onNewProject={() => setIsNewProjectModalOpen(true)} />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="flex-1 relative">
          {renderView()}
        </main>
      </div>

      {/* Global New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/20">
              <h3 className="font-headline text-xl font-bold text-on-surface">Create New {APP_CONFIG.projectLabel}</h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label htmlFor="new-project-title" className="block text-sm font-bold text-on-surface-variant mb-2">{APP_CONFIG.projectLabel} Title</label>
              <input
                id="new-project-title"
                type="text"
                autoFocus
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNewProject()}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., Website Redesign"
              />
            </div>
            <div className="p-6 bg-surface-container-low flex justify-end gap-3 border-t border-outline-variant/20">
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewProject}
                disabled={!newProjectTitle.trim()}
                className="px-6 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create {APP_CONFIG.projectLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children, isAuthenticated, isLoading }: { children: React.ReactNode, isAuthenticated: boolean, isLoading: boolean }) {
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const allowedDomain = import.meta.env.VITE_ALLOWED_DOMAIN;
        if (allowedDomain && user.email && !user.email.endsWith(`@${allowedDomain}`)) {
          await signOut(auth);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicView />} />
          <Route path="/login" element={<LoginView />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <InternalApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
