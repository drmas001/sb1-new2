import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, FileText, UserMinus } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome to Patient Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Link to="/admit" className="card hover:bg-indigo-50 transition-colors duration-200">
          <UserPlus className="w-12 h-12 text-indigo-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Admit Patient</h2>
          <p className="text-gray-600">Add a new patient to the system</p>
        </Link>
        <Link to="/specialties" className="card hover:bg-indigo-50 transition-colors duration-200">
          <Users className="w-12 h-12 text-indigo-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Specialties</h2>
          <p className="text-gray-600">View patients by medical specialty</p>
        </Link>
        <Link to="/reports" className="card hover:bg-indigo-50 transition-colors duration-200">
          <FileText className="w-12 h-12 text-indigo-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Daily Reports</h2>
          <p className="text-gray-600">Generate and view daily patient reports</p>
        </Link>
        <Link to="/discharge" className="card hover:bg-indigo-50 transition-colors duration-200">
          <UserMinus className="w-12 h-12 text-indigo-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Discharge Patient</h2>
          <p className="text-gray-600">Discharge a patient from the system</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;