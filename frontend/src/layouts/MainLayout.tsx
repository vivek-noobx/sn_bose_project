import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Upload, LayoutDashboard, ClipboardList, Sparkles, LogOut, User as UserIcon } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCandidate = user?.role === 'candidate';

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col fixed inset-y-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
          <Sparkles className="w-6 h-6 mr-2 text-orange-500" />
          <span className="text-xl font-black text-white">
            Talent<span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">AI</span>
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {/* Main shared dashboard */}
          <NavItem to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" exact />
          
          {/* Candidate-only links */}
          {isCandidate && (
            <>
              <NavItem to="/dashboard/upload" icon={<Upload className="w-5 h-5" />} label="Resume Upload" />
              <NavItem to="/dashboard/matches" icon={<Briefcase className="w-5 h-5" />} label="Job Matches" />
              <NavItem to="/dashboard/assessment" icon={<ClipboardList className="w-5 h-5" />} label="Assessment" />
            </>
          )}
        </nav>
        
        {/* Sidebar Footer with Logged In User Details and Logout */}
        <div className="p-4 border-t border-white/[0.06] flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-orange-400 truncate capitalize">{user?.role} Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-white/[0.04] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/[0.06] rounded-xl text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col bg-[#050505]">
        <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-white">
            {isCandidate ? 'Candidate Workspace' : 'Recruiter Workspace'}
          </h1>
          <div className="text-sm font-medium text-gray-400">
            Role: <span className="font-bold text-orange-400 capitalize">{user?.role}</span>
          </div>
        </header>
        <div className="p-8 flex-1 bg-[#050505]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, exact }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 rounded-xl transition ${
        isActive
          ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold shadow-md shadow-orange-500/20'
          : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
      }`
    }
  >
    {icon}
    <span className="ml-3 font-medium">{label}</span>
  </NavLink>
);

export default MainLayout;
