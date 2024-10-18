import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Patient } from '../types';
import { UserMinus } from 'lucide-react';

interface DischargePatientProps {
  patients: Patient[];
  onDischarge: (patientId: string, dischargeNotes: string) => Promise<Patient>;
}

const DischargePatient: React.FC<DischargePatientProps> = ({ patients, onDischarge }) => {
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [isDischarging, setIsDischarging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return <div className="text-center mt-8">Patient not found</div>;
  }

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsDischarging(true);
    setError(null);
    try {
      await onDischarge(id, dischargeNotes);
      navigate('/'); // Navigate to home screen after successful discharge
    } catch (error: any) {
      setError(`An error occurred while discharging the patient: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsDischarging(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
        <UserMinus className="mr-2" />
        Discharge Patient
      </h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.name}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">MRN</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.mrn}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.age}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.diagnosis}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(patient.admissionDate).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>
      <form onSubmit={handleDischarge} className="space-y-4">
        <div>
          <label htmlFor="dischargeNotes" className="block text-sm font-medium text-gray-700">Discharge Notes</label>
          <textarea
            id="dischargeNotes"
            value={dischargeNotes}
            onChange={(e) => setDischargeNotes(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={4}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          disabled={isDischarging}
        >
          {isDischarging ? 'Discharging...' : 'Discharge Patient'}
        </button>
      </form>
    </div>
  );
};

export default DischargePatient;