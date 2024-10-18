import React, { useState } from 'react';
import { Patient, Specialty, MedicalNote } from '../types';
import { Calendar, Clock, User, FileText, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface SpecialtyPageProps {
  specialty: Specialty;
  patients: Patient[];
}

const SpecialtyPage: React.FC<SpecialtyPageProps> = ({ specialty, patients }) => {
  const [notes, setNotes] = useState<{ [patientId: string]: string }>({});
  const [loading, setLoading] = useState<{ [patientId: string]: boolean }>({});
  const [error, setError] = useState<{ [patientId: string]: string }>({});

  const specialtyPatients = patients.filter(patient => patient.specialty === specialty);
  const activePatients = specialtyPatients.filter(patient => patient.status === 'Active');
  const dischargedPatients = specialtyPatients.filter(patient => patient.status === 'Discharged');

  const handleNoteChange = (patientId: string, note: string) => {
    setNotes(prevNotes => ({ ...prevNotes, [patientId]: note }));
  };

  const handleAddNote = async (patientId: string) => {
    const note = notes[patientId];
    if (note && note.trim()) {
      setLoading(prev => ({ ...prev, [patientId]: true }));
      setError(prev => ({ ...prev, [patientId]: '' }));
      try {
        const newNote: Omit<MedicalNote, 'id'> = {
          patientId,
          date: new Date().toISOString(),
          note,
          user: 'Current User', // Replace with actual user when authentication is implemented
        };
        await api.addMedicalNote(newNote);
        setNotes(prevNotes => ({ ...prevNotes, [patientId]: '' }));
        console.log('Note added successfully');
      } catch (error: any) {
        console.error('Error adding note:', error);
        setError(prev => ({ ...prev, [patientId]: `Error adding note: ${error.response?.data?.error || error.message}` }));
      } finally {
        setLoading(prev => ({ ...prev, [patientId]: false }));
      }
    }
  };

  const renderPatientList = (patientList: Patient[], isActive: boolean) => (
    <div className="space-y-6">
      {patientList.map(patient => (
        <div key={patient.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
          {/* ... (keep the existing patient information display) ... */}
          <div className="mt-3">
            <label htmlFor={`note-${patient.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              Add Note
            </label>
            <textarea
              id={`note-${patient.id}`}
              rows={3}
              className="input w-full text-sm"
              placeholder={`Add a note for ${patient.name}...`}
              value={notes[patient.id] || ''}
              onChange={(e) => handleNoteChange(patient.id, e.target.value)}
            />
            <button
              onClick={() => handleAddNote(patient.id)}
              disabled={loading[patient.id] || !notes[patient.id]?.trim()}
              className="btn btn-primary mt-2 text-sm flex items-center justify-center"
            >
              {loading[patient.id] ? (
                'Adding...'
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Note
                </>
              )}
            </button>
            {error[patient.id] && <p className="text-red-500 text-sm mt-1">{error[patient.id]}</p>}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="card">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">{specialty}</h3>
      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-2 text-gray-700">Active Patients</h4>
        {activePatients.length === 0 ? (
          <p className="text-gray-600">No active patients in this specialty.</p>
        ) : (
          renderPatientList(activePatients, true)
        )}
      </div>
      <div>
        <h4 className="text-xl font-semibold mb-2 text-gray-700">Discharged Patients</h4>
        {dischargedPatients.length === 0 ? (
          <p className="text-gray-600">No discharged patients in this specialty.</p>
        ) : (
          renderPatientList(dischargedPatients, false)
        )}
      </div>
    </div>
  );
};

export default SpecialtyPage;