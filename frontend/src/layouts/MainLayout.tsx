import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Upload, LayoutDashboard, ClipboardList, Sparkles, LogOut, User as UserIcon } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCandidate = user?.role === 'candidate';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-primary-dark text-slate-300 flex flex-col fixed inset-y-0 shadow-xl border-r border-accent-teal/10 z-20">
        <div className="h-16 flex items-center px-6 bg-primary-dark/85 font-black text-white text-xl border-b border-accent-teal/20">
          <Sparkles className="w-6 h-6 mr-2 text-accent-seafoam" />
          <span>TalentAI</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {/* Main shared dashboard */}
          <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" exact />
          
          {/* Candidate-only links */}
          {isCandidate && (
            <>
              <NavItem to="/upload" icon={<Upload className="w-5 h-5" />} label="Resume Upload" />
              <NavItem to="/matches" icon={<Briefcase className="w-5 h-5" />} label="Job Matches" />
              <NavItem to="/assessment" icon={<ClipboardList className="w-5 h-5" />} label="Assessment" />
            </>
          )}
        </nav>
        
        {/* Sidebar Footer with Logged In User Details and Logout */}
        <div className="p-4 border-t border-accent-teal/20 bg-primary-dark/95 flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent-teal/20 rounded-lg text-accent-seafoam">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xxs text-accent-teal truncate capitalize">{user?.role} Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-accent-teal/10 hover:bg-red-950/20 text-slate-300 hover:text-red-300 border border-accent-teal/20 rounded-xl text-sm font-medium transition duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-bold text-primary-dark">
            {isCandidate ? 'Candidate Workspace' : 'Recruiter Workspace'}
          </h1>
          <div className="text-sm font-medium text-slate-500">
            Role: <span className="font-bold text-primary-dark capitalize">{user?.role}</span>
          </div>
        </header>
        <div className="p-8 flex-1 bg-white">
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
      `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-accent-seafoam text-primary-dark font-bold shadow-md shadow-accent-seafoam/20'
          : 'hover:bg-slate-800 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="ml-3 font-medium">{label}</span>
  </NavLink>
);

export default MainLayout;
