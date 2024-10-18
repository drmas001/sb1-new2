import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UserPlus, Users, FileText, Download, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-indigo-600 text-white flex flex-col items-center py-4 space-y-8">
      <Link to="/" className={`p-2 rounded-lg hover:bg-indigo-700 transition-colors ${isActive('/')}`}>
        <Home className="w-6 h-6" />
      </Link>
      <Link to="/admit" className={`p-2 rounded-lg hover:bg-indigo-700 transition-colors ${isActive('/admit')}`}>
        <UserPlus className="w-6 h-6" />
      </Link>
      <Link to="/specialties" className={`p-2 rounded-lg hover:bg-indigo-700 transition-colors ${isActive('/specialties')}`}>
        <Users className="w-6 h-6" />
      </Link>
      <Link to="/reports" className={`p-2 rounded-lg hover:bg-indigo-700 transition-colors ${isActive('/reports')}`}>
        <FileText className="w-6 h-6" />
      </Link>
      <Link to="/extract" className={`p-2 rounded-lg hover:bg-indigo-700 transition-colors ${isActive('/extract')}`}>
        <Download className="w-6 h-6" />
      </Link>
      <div className="flex-grow"></div>
      <button className="p-2 rounded-lg hover:bg-indigo-700 transition-colors">
        <LogOut className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Sidebar;