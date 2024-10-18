import React, { useState, useEffect } from 'react';
import { Patient, Specialty } from '../types';
import { Calendar, Download, Printer, Users, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import { api } from '../services/api';

const DailyReportComponent: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'specialty' | 'day'>('specialty');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedPatients, fetchedSpecialties] = await Promise.all([
          api.getPatients(),
          api.getSpecialties()
        ]);
        setPatients(fetchedPatients);
        setSpecialties(fetchedSpecialties);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(`Failed to load report data: ${error.response?.data?.error || error.message}`);
        setPatients([]);
        setSpecialties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterPatientsByDate = (patients: Patient[], date: string) => {
    return patients.filter(patient => {
      const admissionDate = new Date(patient.admissionDate);
      const reportDate = new Date(date);
      return (
        admissionDate.getFullYear() === reportDate.getFullYear() &&
        admissionDate.getMonth() === reportDate.getMonth() &&
        admissionDate.getDate() === reportDate.getDate()
      );
    });
  };

  const generatePDFContent = () => {
    let content = `Daily Report - ${selectedDate}\n\n`;

    if (viewMode === 'specialty') {
      specialties.forEach((specialty) => {
        const specialtyPatients = patients.filter(p => p.specialty === specialty);
        const activePatients = filterPatientsByDate(specialtyPatients.filter(p => p.status === 'Active'), selectedDate);
        const dischargedPatients = filterPatientsByDate(specialtyPatients.filter(p => p.status === 'Discharged'), selectedDate);

        content += `${specialty}\n`;
        content += `Active Patients:\n`;
        activePatients.forEach(patient => {
          content += `- ${patient.name} (MRN: ${patient.mrn}, Age: ${patient.age}, Admitted: ${new Date(patient.admissionDate).toLocaleString()})\n`;
        });
        content += `Discharged Patients:\n`;
        dischargedPatients.forEach(patient => {
          content += `- ${patient.name} (MRN: ${patient.mrn}, Age: ${patient.age}, Discharged: ${new Date(patient.dischargeDate!).toLocaleString()})\n`;
        });
        content += '\n';
      });
    } else {
      const allPatients = filterPatientsByDate(patients, selectedDate);
      const activePatients = allPatients.filter(p => p.status === 'Active');
      const dischargedPatients = allPatients.filter(p => p.status === 'Discharged');

      content += `Active Patients:\n`;
      activePatients.forEach(patient => {
        content += `- ${patient.name} (MRN: ${patient.mrn}, Age: ${patient.age}, Specialty: ${patient.specialty}, Admitted: ${new Date(patient.admissionDate).toLocaleString()})\n`;
      });
      content += `\nDischarged Patients:\n`;
      dischargedPatients.forEach(patient => {
        content += `- ${patient.name} (MRN: ${patient.mrn}, Age: ${patient.age}, Specialty: ${patient.specialty}, Discharged: ${new Date(patient.dischargeDate!).toLocaleString()})\n`;
      });
    }

    return content;
  };

  const handleDownload = () => {
    const content = generatePDFContent();
    const pdf = new jsPDF();
    
    pdf.setFontSize(12);
    const splitContent = pdf.splitTextToSize(content, 180);
    pdf.text(splitContent, 15, 15);
    
    pdf.save(`daily_report_${selectedDate}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSpecialtyView = () => (
    <>
      {specialties.map((specialty) => {
        const specialtyPatients = patients.filter(p => p.specialty === specialty);
        const activePatients = filterPatientsByDate(specialtyPatients.filter(p => p.status === 'Active'), selectedDate);
        const dischargedPatients = filterPatientsByDate(specialtyPatients.filter(p => p.status === 'Discharged'), selectedDate);

        return (
          <div key={specialty} className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              {specialty}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-medium mb-2 text-gray-700">Active Patients</h4>
                <ul className="space-y-2">
                  {activePatients.map((patient) => (
                    <li key={`active-${patient.mrn}`} className="bg-green-50 p-2 rounded-md text-green-800">
                      {patient.name} (MRN: {patient.mrn}, Age: {patient.age}, Admitted: {new Date(patient.admissionDate).toLocaleString()})
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-medium mb-2 text-gray-700">Discharged Patients</h4>
                <ul className="space-y-2">
                  {dischargedPatients.map((patient) => (
                    <li key={`discharged-${patient.mrn}`} className="bg-gray-50 p-2 rounded-md text-gray-800">
                      {patient.name} (MRN: {patient.mrn}, Age: {patient.age}, Discharged: {new Date(patient.dischargeDate!).toLocaleString()})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );

  const renderDayView = () => {
    const allPatients = filterPatientsByDate(patients, selectedDate);
    const activePatients = allPatients.filter(p => p.status === 'Active');
    const dischargedPatients = allPatients.filter(p => p.status === 'Discharged');

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          Daily Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xl font-medium mb-2 text-gray-700">Active Patients</h4>
            <ul className="space-y-2">
              {activePatients.map((patient) => (
                <li key={`active-${patient.mrn}`} className="bg-green-50 p-2 rounded-md text-green-800">
                  {patient.name} (MRN: {patient.mrn}, Age: {patient.age}, Specialty: {patient.specialty}, Admitted: {new Date(patient.admissionDate).toLocaleString()})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-medium mb-2 text-gray-700">Discharged Patients</h4>
            <ul className="space-y-2">
              {dischargedPatients.map((patient) => (
                <li key={`discharged-${patient.mrn}`} className="bg-gray-50 p-2 rounded-md text-gray-800">
                  {patient.name} (MRN: {patient.mrn}, Age: {patient.age}, Specialty: {patient.specialty}, Discharged: {new Date(patient.dischargeDate!).toLocaleString()})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Daily Report</h2>
        <div className="flex space-x-4">
          <button onClick={handleDownload} className="btn btn-secondary flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </button>
          <button onClick={handlePrint} className="btn btn-secondary flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            Print
          </button>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input py-1 px-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'specialty' | 'day')}
              className="input py-1 px-2"
            >
              <option value="specialty">View by Specialty</option>
              <option value="day">View by Day</option>
            </select>
          </div>
        </div>
        {viewMode === 'specialty' ? renderSpecialtyView() : renderDayView()}
      </div>
    </div>
  );
};

export default DailyReportComponent;