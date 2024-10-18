const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/patients', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM patients');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/patients', async (req, res) => {
  const { mrn, name, age, gender, diagnosis, admissionDate, specialty, assignedDoctor } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO patients(mrn, name, age, gender, diagnosis, admission_date, status, specialty, assigned_doctor) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [mrn, name, age, gender, diagnosis, admissionDate, 'Active', specialty, assignedDoctor]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/patients/:mrn', async (req, res) => {
  const { mrn } = req.params;
  const { name, age, gender, diagnosis, specialty, assignedDoctor } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE patients SET name = $1, age = $2, gender = $3, diagnosis = $4, specialty = $5, assigned_doctor = $6 WHERE mrn = $7 RETURNING *',
      [name, age, gender, diagnosis, specialty, assignedDoctor, mrn]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients/:mrn/notes', async (req, res) => {
  const { mrn } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM medical_notes WHERE patient_mrn = $1', [mrn]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching medical notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/notes', async (req, res) => {
  const { patientMrn, date, note, user } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO medical_notes(patient_mrn, date, note, user) VALUES($1, $2, $3, $4) RETURNING *',
      [patientMrn, date, note, user]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding medical note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/patients/:mrn/discharge', async (req, res) => {
  const { mrn } = req.params;
  const { dischargeNotes } = req.body;
  try {
    await pool.query('BEGIN');
    const { rows } = await pool.query(
      'UPDATE patients SET status = $1, discharge_date = $2 WHERE mrn = $3 RETURNING *',
      ['Discharged', new Date().toISOString(), mrn]
    );
    await pool.query(
      'INSERT INTO medical_notes(patient_mrn, date, note, user) VALUES($1, $2, $3, $4)',
      [mrn, new Date().toISOString(), `Discharge notes: ${dischargeNotes}`, 'System']
    );
    await pool.query('COMMIT');
    res.json(rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error discharging patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/specialties', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT specialty FROM patients');
    res.json(rows.map(row => row.specialty));
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});