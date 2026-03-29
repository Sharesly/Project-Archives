import { BarChart3, Kanban, AlertCircle, Calendar, Plus, HelpCircle, Settings2 } from 'lucide-react';
import { APP_CONFIG } from '../config';

export default function Sidebar({ currentView, setCurrentView, onNewProject }: { currentView: string, setCurrentView: (v: string) => void, onNewProject: () => void }) {
  const navItems = [
    { id: 'kanban', icon: Kanban, label: 'Kanban Board' },
    { id: 'priority', icon: AlertCircle, label: 'Priority Matrix' },
    { id: 'portfolio', icon: Calendar, label: 'Portfolio Overview' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 flex flex-col py-8 px-6 space-y-4">
      <div className="mb-8 px-2 flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
          <BarChart3 className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="font-headline text-lg font-bold text-brand-dark leading-tight">{APP_CONFIG.portalName}</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">{APP_CONFIG.orgName}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-slate-600 hover:text-brand-dark hover:bg-slate-200/50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:translate-x-1 transition-transform'}`} />
              <span className="font-inter text-sm font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="pt-6 border-t border-slate-200/50 space-y-1">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-gradient-to-b from-primary to-primary-container text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New {APP_CONFIG.projectLabel}</span>
        </button>
        <div className="h-4"></div>
        <button className="w-full flex items-center space-x-3 px-4 py-2 text-slate-600 hover:text-brand-dark text-xs font-medium focus:outline-2 focus:outline-primary rounded-lg" aria-label="Help">
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-2 text-slate-600 hover:text-brand-dark text-xs font-medium focus:outline-2 focus:outline-primary rounded-lg" aria-label="Settings">
          <Settings2 className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
