import React, { useState, useEffect } from 'react';
import { Patient, MedicalNote } from '../types';
import { Calendar, Clock, User, FileText, PlusCircle } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

interface PatientDetailsProps {
  patients: Patient[];
  onAddNote: (note: Omit<MedicalNote, 'id'>) => Promise<MedicalNote>;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patients, onAddNote }) => {
  const [newNote, setNewNote] = useState('');
  const [patientNotes, setPatientNotes] = useState<MedicalNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mrn } = useParams<{ mrn: string }>();

  const patient = patients.find(p => p.mrn === mrn);

  useEffect(() => {
    const fetchNotes = async () => {
      if (mrn) {
        setIsLoading(true);
        try {
          const notes = await api.getMedicalNotes(mrn);
          setPatientNotes(notes);
        } catch (error) {
          console.error('Error fetching notes:', error);
          setError('Failed to fetch patient notes. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchNotes();
  }, [mrn]);

  const handleAddNote = async () => {
    if (newNote.trim() && patient) {
      setIsLoading(true);
      setError(null);
      try {
        const noteToAdd: Omit<MedicalNote, 'id'> = {
          patientMrn: patient.mrn,
          date: new Date().toISOString(),
          note: newNote,
          user: 'Current User', // Replace with actual user when authentication is implemented
        };
        const addedNote = await onAddNote(noteToAdd);
        setPatientNotes(prevNotes => [...prevNotes, addedNote]);
        setNewNote('');
      } catch (error) {
        console.error('Error adding note:', error);
        setError('Failed to add note. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!patient) {
    return <div className="text-center mt-8">Patient not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Patient Details</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {patient.name}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">MRN: {patient.mrn}</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.age}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.gender}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.diagnosis}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(patient.admissionDate).toLocaleString()}
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.status}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Specialty</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.specialty}</dd>
            </div>
            {patient.assignedDoctor && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Assigned Doctor</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.assignedDoctor}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Note</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Add a new medical note for this patient.</p>
          </div>
          <div className="mt-5">
            <textarea
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
          </div>
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleAddNote}
              disabled={isLoading || !newNote.trim()}
            >
              {isLoading ? 'Adding...' : 'Add Note'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Medical Notes</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {patientNotes.map((note) => (
              <li key={note.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">{note.note}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {new Date(note.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {note.user}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;