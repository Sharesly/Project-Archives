import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Project } from '../types';
import { FolderArchive, ArrowRight, BarChart3, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../config';

export default function PublicView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects();
        // Only show projects that are somewhat active or launched
        setProjects(data.filter(p => !['Intake / Proposed'].includes(p.status)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FolderArchive className="text-white w-4 h-4" />
            </div>
            <div>
              <h1 className="font-headline text-lg font-bold text-brand-dark leading-tight">{APP_CONFIG.portalName}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{APP_CONFIG.subHeading}</p>
            </div>
          </div>
          <Link 
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2"
          >
            Team Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-4xl sm:text-5xl font-extrabold font-headline tracking-tight mb-6">
              {APP_CONFIG.heroTitle}
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
              {APP_CONFIG.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 border border-white/20">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Active Initiatives</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 border border-white/20">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.filter(p => p.status === 'Launched').length}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Successfully Launched</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-slate-900 font-headline">Current Portfolio</h3>
          <p className="text-slate-600 mt-2">An overview of our ongoing and completed AI transformation projects.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {project.department}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      project.status === 'Launched' ? 'bg-emerald-100 text-emerald-800' :
                      project.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{project.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-6">{project.description}</p>
                  
                  {project.progress > 0 && (
                    <div className="mt-auto">
                      <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {project.owner.avatar ? (
                      <img src={project.owner.avatar} alt={project.owner.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {project.owner.initials}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-600">{project.owner.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Updated Recently</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 opacity-50">
            <FolderArchive className="w-5 h-5 text-slate-900" />
            <span className="font-headline font-bold text-slate-900">{APP_CONFIG.portalName}</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {APP_CONFIG.footerText}
          </p>
        </div>
      </footer>
    </div>
  );
}
