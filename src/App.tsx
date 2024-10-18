import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import AdmitPatient from './components/AdmitPatient';
import SpecialtyPage from './components/SpecialtyPage';
import PatientDetails from './components/PatientDetails';
import DischargePatient from './components/DischargePatient';
import DischargeList from './components/DischargeList';
import DailyReportComponent from './components/DailyReport';
import ExtractPatientData from './components/ExtractPatientData';
import { Patient, MedicalNote, Specialty } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedPatients = await api.getPatients();
      setPatients(fetchedPatients);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients. Please try again later.');
      setPatients([]); // Ensure patients is always an array
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleAddPatient = async (newPatient: Omit<Patient, 'id'>) => {
    try {
      const addedPatient = await api.addPatient(newPatient);
      setPatients(prevPatients => [...prevPatients, addedPatient]);
      return addedPatient;
    } catch (error: any) {
      console.error('Error adding patient:', error);
      throw new Error(`Failed to add patient: ${error.message}`);
    }
  };

  const handleDischargePatient = async (patientId: string, dischargeNotes: string) => {
    try {
      const updatedPatient = await api.dischargePatient(patientId, dischargeNotes);
      setPatients(prevPatients => 
        prevPatients.map(p => p.id === patientId ? updatedPatient : p)
      );
      return updatedPatient;
    } catch (error: any) {
      console.error('Error discharging patient:', error);
      throw new Error(`Failed to discharge patient: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Get unique specialties from patients
  const specialties = Array.from(new Set(patients.map(p => p.specialty)));

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-16">
          <Navigation />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admit" element={<AdmitPatient onAdmit={handleAddPatient} />} />
              <Route path="/specialties" element={
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">Specialties</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {specialties.map(specialty => (
                      <SpecialtyPage
                        key={specialty}
                        specialty={specialty}
                        patients={patients.filter(p => p.specialty === specialty)}
                      />
                    ))}
                  </div>
                </div>
              } />
              <Route path="/patient/:id" element={<PatientDetails patients={patients} onAddNote={api.addMedicalNote} />} />
              <Route path="/discharge" element={<DischargeList patients={patients.filter(p => p.status === 'Active')} onRequestDischarge={handleDischargePatient} />} />
              <Route path="/discharge/:id" element={<DischargePatient patients={patients} onDischarge={handleDischargePatient} />} />
              <Route path="/reports" element={<DailyReportComponent />} />
              <Route path="/extract" element={<ExtractPatientData />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;