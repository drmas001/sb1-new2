import React, { useState } from 'react';
import { Patient, MedicalNote } from '../types';
import { Calendar, Download, Filter } from 'lucide-react';
import { api } from '../services/api';
import jsPDF from 'jspdf';

interface ExtractedPatient extends Patient {
  notes: MedicalNote[];
}

const ExtractPatientData: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedPatient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const patients = await api.getPatients();
      const filteredPatients = patients.filter(patient => {
        const admissionDate = new Date(patient.admissionDate);
        return admissionDate >= new Date(startDate) && admissionDate <= new Date(endDate);
      });

      const extractedData = await Promise.all(filteredPatients.map(async patient => {
        const notes = await api.getMedicalNotes(patient.id);
        return { ...patient, notes };
      }));

      setExtractedData(extractedData);
    } catch (error: any) {
      console.error('Error extracting data:', error);
      setError(`An error occurred while extracting data: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = () => {
    if (extractedData.length === 0) {
      setError('No data to generate PDF. Please extract data first.');
      return;
    }

    const pdf = new jsPDF();
    let yOffset = 10;

    pdf.setFontSize(16);
    pdf.text(`Patient Data Extract (${startDate} to ${endDate})`, 10, yOffset);
    yOffset += 10;

    extractedData.forEach((patient) => {
      if (yOffset > 280) {
        pdf.addPage();
        yOffset = 10;
      }

      pdf.setFontSize(14);
      pdf.text(`Patient: ${patient.name} (MRN: ${patient.mrn})`, 10, yOffset);
      yOffset += 7;

      pdf.setFontSize(12);
      pdf.text(`Specialty: ${patient.specialty}`, 10, yOffset);
      yOffset += 7;

      pdf.text(`Admission Date: ${new Date(patient.admissionDate).toLocaleDateString()}`, 10, yOffset);
      yOffset += 7;

      if (patient.dischargeDate) {
        pdf.text(`Discharge Date: ${new Date(patient.dischargeDate).toLocaleDateString()}`, 10, yOffset);
        yOffset += 7;
      }

      pdf.text(`Status: ${patient.status}`, 10, yOffset);
      yOffset += 7;

      pdf.text('Notes:', 10, yOffset);
      yOffset += 7;

      patient.notes.forEach(note => {
        if (yOffset > 280) {
          pdf.addPage();
          yOffset = 10;
        }

        const noteText = `${new Date(note.date).toLocaleString()}: ${note.note}`;
        const splitText = pdf.splitTextToSize(noteText, 180);
        pdf.text(splitText, 15, yOffset);
        yOffset += 7 * splitText.length;
      });

      yOffset += 10;
    });

    pdf.save(`patient_data_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Extract Patient Data</h2>
      <div className="card space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-grow">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="flex-grow">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>
        <button onClick={handleExtract} disabled={isLoading} className="btn btn-primary w-full">
          {isLoading ? 'Extracting...' : 'Extract Data'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      {extractedData.length > 0 && (
        <div className="card space-y-4">
          <h3 className="text-xl font-semibold">Extracted Data</h3>
          <ul className="space-y-4">
            {extractedData.map((patient) => (
              <li key={patient.id} className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold">{patient.name} (MRN: {patient.mrn})</h4>
                <p className="text-sm text-gray-600">Specialty: {patient.specialty}</p>
                <p className="text-sm text-gray-600">Admitted: {new Date(patient.admissionDate).toLocaleString()}</p>
                {patient.dischargeDate && (
                  <p className="text-sm text-gray-600">Discharged: {new Date(patient.dischargeDate).toLocaleString()}</p>
                )}
                <p className="text-sm text-gray-600">Status: {patient.status}</p>
                <h5 className="font-medium mt-2">Notes:</h5>
                <ul className="list-disc list-inside">
                  {patient.notes.map(note => (
                    <li key={note.id} className="text-sm">
                      {new Date(note.date).toLocaleString()}: {note.note}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <button onClick={generatePDF} className="btn btn-secondary w-full">
            <Download className="w-5 h-5 mr-2" />
            Generate PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExtractPatientData;