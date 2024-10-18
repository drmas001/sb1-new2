import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, PlusCircle, Download } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <nav className="bg-indigo-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <Home className="mr-2" />
            Patient Management
          </Link>
          <div className="flex space-x-1">
            <Link to="/admit" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/admit')}`}>
              <PlusCircle className="mr-1 h-5 w-5" />
              Admit
            </Link>
            <Link to="/specialties" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/specialties')}`}>
              <Users className="mr-1 h-5 w-5" />
              Specialties
            </Link>
            <Link to="/reports" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/reports')}`}>
              <FileText className="mr-1 h-5 w-5" />
              Reports
            </Link>
            <Link to="/extract" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/extract')}`}>
              <Download className="mr-1 h-5 w-5" />
              Extract Data
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;