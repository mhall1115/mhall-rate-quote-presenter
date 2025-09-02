
import React from 'react';

interface SidebarProps {
  onNavigate: (view: 'list' | 'form') => void;
  currentView: 'list' | 'form' | 'summary' | 'borrowerView';
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ onClick, isActive, icon, children }) => {
  const activeClasses = 'bg-brand/20 text-white';
  const inactiveClasses = 'text-gray-400 hover:text-white hover:bg-white/5';

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive ? activeClasses : inactiveClasses
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView }) => {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/10 flex-col z-20 hidden md:flex">
      <div className="flex-grow p-4">
        {/* Header */}
        <div className="flex items-center px-2 mb-8 h-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <h1 className="ml-3 text-lg font-bold text-gray-100 tracking-wider">
            Smart Retail Rate Quotes
          </h1>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink 
            onClick={() => onNavigate('list')} 
            isActive={currentView === 'list' || currentView === 'summary' || currentView === 'borrowerView'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7.5a.5.5 0 01-.5.5H5.5a.5.5 0 01-.5-.5V5z" /></svg>}
          >
            Dashboard
          </NavLink>
          <NavLink 
            onClick={() => onNavigate('form')} 
            isActive={currentView === 'form'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>}
          >
            New Quote
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};