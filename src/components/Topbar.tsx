import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { APP_CONFIG } from '../config';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Topbar({ searchQuery, onSearchChange }: TopbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const userName = auth.currentUser?.displayName || 'Team Member';
  const initials = userName.substring(0, 2).toUpperCase();

  return (
    <header className="bg-white/85 backdrop-blur-xl sticky top-0 z-30 flex justify-between items-center w-full px-10 h-16 shadow-[0_8px_32px_rgba(25,28,30,0.06)]">
      <div className="flex items-center space-x-8">
        <span className="text-2xl font-black tracking-tighter text-brand-dark font-headline">{APP_CONFIG.appName}</span>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-2 focus:ring-primary-container transition-all outline-none"
            placeholder={`Search ${APP_CONFIG.projectLabelPlural.toLowerCase()}...`}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex space-x-2">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors" aria-label="Settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
        <div className="flex items-center space-x-3 pl-2">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-brand-dark">{userName}</p>
            <p className="text-[10px] text-on-surface-variant">{APP_CONFIG.defaultRoleLabel}</p>
          </div>
          {auth.currentUser?.photoURL ? (
            <img
              alt={`${userName} profile`}
              className="w-9 h-9 rounded-full object-cover border-2 border-primary-container/20"
              src={auth.currentUser.photoURL}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-white border-2 border-primary-container/20">
              {initials}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-error hover:bg-error/10 rounded-full transition-colors ml-2"
            aria-label="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
