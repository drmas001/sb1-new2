import axios from 'axios';
import { Patient, MedicalNote, Specialty } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleApiError = (error: any) => {
  console.error('API Error:', error.response?.data?.error || error.message);
  throw error;
};

export const api = {
  async getPatients(): Promise<Patient[]> {
    try {
      const response = await axios.get(`${API_URL}/patients`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      handleApiError(error);
      return [];
    }
  },

  async addPatient(patient: Patient): Promise<Patient> {
    try {
      const response = await axios.post(`${API_URL}/patients`, patient);
      return response.data;
    } catch (error) {
      console.error('Error adding patient:', error);
      handleApiError(error);
      throw error;
    }
  },

  async updatePatient(mrn: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const response = await axios.put(`${API_URL}/patients/${mrn}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      handleApiError(error);
      throw error;
    }
  },

  async getMedicalNotes(mrn: string): Promise<MedicalNote[]> {
    try {
      const response = await axios.get(`${API_URL}/patients/${mrn}/notes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical notes:', error);
      handleApiError(error);
      return [];
    }
  },

  async addMedicalNote(note: Omit<MedicalNote, 'id'>): Promise<MedicalNote> {
    try {
      const response = await axios.post(`${API_URL}/notes`, note);
      return response.data;
    } catch (error) {
      console.error('Error adding medical note:', error);
      handleApiError(error);
      throw error;
    }
  },

  async dischargePatient(mrn: string, dischargeNotes: string): Promise<Patient> {
    try {
      const response = await axios.post(`${API_URL}/patients/${mrn}/discharge`, { dischargeNotes });
      return response.data;
    } catch (error) {
      console.error('Error discharging patient:', error);
      handleApiError(error);
      throw error;
    }
  },

  async getSpecialties(): Promise<Specialty[]> {
    try {
      const response = await axios.get(`${API_URL}/specialties`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching specialties:', error);
      handleApiError(error);
      return [];
    }
  },
};