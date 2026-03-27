import { Filter, Users, Plus, MoreHorizontal, Paperclip, AlertCircle, CheckCircle2, MoveDown, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Project, ProjectStatus } from '../types';

const COLUMNS: { title: ProjectStatus; color: string; border: string }[] = [
  { title: 'Intake / Proposed', color: 'bg-on-surface-variant/40', border: 'border-slate-300' },
  { title: 'Scoping', color: 'bg-primary/40', border: 'border-primary-fixed' },
  { title: 'In Progress', color: 'bg-blue-500 animate-pulse', border: 'border-blue-600' },
  { title: 'Pilot / Testing', color: 'bg-amber-500', border: 'border-amber-500' },
  { title: 'Review / Approval', color: 'bg-purple-500', border: 'border-purple-500' },
  { title: 'Launched', color: 'bg-tertiary-fixed', border: 'border-tertiary-fixed-dim' }
];

export default function KanbanView({ onProjectClick, onNewProject, refreshTrigger }: { onProjectClick: (id: string) => void, onNewProject: () => void, refreshTrigger?: number }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('projectId', projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');
    if (!projectId) return;

    // Optimistic update
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));

    try {
      await api.updateProject(projectId, { status });
    } catch (error) {
      console.error(error);
      fetchProjects(); // Revert on error
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilter(prev => prev === filter ? null : filter);
  };

  // Apply basic filtering (just visual for now, or sorting)
  const getFilteredProjects = (colProjects: Project[]) => {
    let filtered = [...colProjects];
    if (activeFilter === 'priority') {
      filtered.sort((a, b) => {
        const p = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return p[b.priority] - p[a.priority];
      });
    } else if (activeFilter === 'owner') {
      filtered.sort((a, b) => a.owner.name.localeCompare(b.owner.name));
    }
    return filtered;
  };

  if (loading) return <div className="p-10">Loading projects...</div>;

  return (
    <div className="p-10 min-h-screen flex flex-col relative">
      <header className="mb-8 flex flex-col space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Global Project Board</h2>
            <p className="text-on-surface-variant mt-1 font-medium">Managing {projects.length} active AI transformation streams across the library network.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => toggleFilter('priority')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeFilter === 'priority' ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Priority</span>
            </button>
            <button 
              onClick={() => toggleFilter('owner')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeFilter === 'owner' ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <Users className="w-5 h-5" />
              <span>Owner</span>
            </button>
            <div className="w-px h-8 bg-outline-variant/30 mx-2"></div>
            <button onClick={onNewProject} className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-b from-primary to-primary-container text-white rounded-sm font-bold shadow-lg hover:scale-[1.02] transition-transform">
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto pb-12 kanban-scroll">
        <div className="flex h-full space-x-6 min-w-max">
          {COLUMNS.map(col => {
            const colProjects = projects.filter(p => p.status === col.title);
            const displayedProjects = getFilteredProjects(colProjects);
            
            return (
              <div 
                key={col.title}
                className="w-80 flex flex-col h-full bg-surface-container-low rounded-xl p-3"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.title)}
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                    <h3 className="font-bold text-sm text-on-surface-variant tracking-wide uppercase">{col.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">{colProjects.length}</span>
                </div>
                
                <div className="space-y-3 overflow-y-auto pr-1 kanban-scroll flex-1">
                  {displayedProjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-outline-variant/30 rounded-lg">
                      <MoveDown className="w-8 h-8 text-outline-variant/50 mb-1" />
                      <p className="text-[10px] font-bold text-on-surface-variant/40">Drop cards here</p>
                    </div>
                  )}
                  {displayedProjects.map(project => (
                    <div 
                      key={project.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, project.id)}
                      onClick={() => onProjectClick(project.id)}
                      className={`bg-surface-container-lowest p-4 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-l-4 ${col.border} hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">{project.code}</span>
                        <MoreHorizontal className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="font-bold text-sm mb-3 leading-snug">{project.title}</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map(tag => (
                          <span key={tag} className="bg-secondary-container text-on-secondary-fixed text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">{tag}</span>
                        ))}
                        <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">{project.priority} Priority</span>
                      </div>
                      
                      {project.progress > 0 && project.progress < 100 && (
                        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-4">
                          <div className="bg-blue-600 h-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                        <div className="flex items-center space-x-2">
                          {project.owner.avatar ? (
                            <img className="w-6 h-6 rounded-full object-cover" src={project.owner.avatar} alt={project.owner.name} />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary">{project.owner.initials}</div>
                          )}
                          <span className="text-[10px] font-medium text-on-surface-variant">{project.owner.name}</span>
                        </div>
                        {project.status === 'Launched' && (
                          <div className="flex items-center space-x-1 text-tertiary-fixed-dim">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold">In Production</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
