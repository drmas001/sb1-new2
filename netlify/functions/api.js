const faunadb = require('faunadb');
const { Pool } = require('pg');
const q = faunadb.query;

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '');
  const method = event.httpMethod;

  console.log(`Received ${method} request for ${path}`);

  try {
    switch (true) {
      case method === 'GET' && path === '/patients':
        // Use Postgres for fetching patients
        const { rows: patients } = await pgPool.query('SELECT * FROM patients');
        return {
          statusCode: 200,
          body: JSON.stringify(patients),
        };

      case method === 'POST' && path === '/patients':
        const newPatient = JSON.parse(event.body);
        // Insert into Postgres
        const { rows: [createdPatient] } = await pgPool.query(
          'INSERT INTO patients(mrn, name, age, gender, diagnosis, admission_date, status, specialty, assigned_doctor) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
          [newPatient.mrn, newPatient.name, newPatient.age, newPatient.gender, newPatient.diagnosis, newPatient.admissionDate, 'Active', newPatient.specialty, newPatient.assignedDoctor]
        );
        // Also insert into Fauna for global distribution
        await faunaClient.query(
          q.Create(q.Collection('patients'), { data: createdPatient })
        );
        return {
          statusCode: 201,
          body: JSON.stringify(createdPatient),
        };

      case method === 'PUT' && path.match(/^\/patients\/[\w-]+$/):
        const updatePatientMRN = path.split('/')[2];
        const updates = JSON.parse(event.body);
        // Update in Postgres
        const { rows: [updatedPatient] } = await pgPool.query(
          'UPDATE patients SET name = $1, age = $2, gender = $3, diagnosis = $4, specialty = $5, assigned_doctor = $6 WHERE mrn = $7 RETURNING *',
          [updates.name, updates.age, updates.gender, updates.diagnosis, updates.specialty, updates.assignedDoctor, updatePatientMRN]
        );
        // Also update in Fauna
        await faunaClient.query(
          q.Update(
            q.Select('ref',
              q.Get(q.Match(q.Index('patients_by_mrn'), updatePatientMRN))
            ),
            { data: updatedPatient }
          )
        );
        return {
          statusCode: 200,
          body: JSON.stringify(updatedPatient),
        };

      case method === 'GET' && path.match(/^\/patients\/[\w-]+\/notes$/):
        const patientMRN = path.split('/')[2];
        // Fetch notes from Postgres
        const { rows: notes } = await pgPool.query('SELECT * FROM medical_notes WHERE patient_mrn = $1', [patientMRN]);
        return {
          statusCode: 200,
          body: JSON.stringify(notes),
        };

      case method === 'POST' && path === '/notes':
        const newNote = JSON.parse(event.body);
        // Insert note into Postgres
        const { rows: [createdNote] } = await pgPool.query(
          'INSERT INTO medical_notes(patient_mrn, date, note, user) VALUES($1, $2, $3, $4) RETURNING *',
          [newNote.patientMrn, newNote.date, newNote.note, newNote.user]
        );
        // Also insert into Fauna for global access
        await faunaClient.query(
          q.Create(q.Collection('notes'), { data: createdNote })
        );
        return {
          statusCode: 201,
          body: JSON.stringify(createdNote),
        };

      case method === 'POST' && path.match(/^\/patients\/[\w-]+\/discharge$/):
        const dischargeMRN = path.split('/')[2];
        const { dischargeNotes } = JSON.parse(event.body);
        // Update patient status and add discharge note in Postgres
        await pgPool.query('BEGIN');
        const { rows: [dischargedPatient] } = await pgPool.query(
          'UPDATE patients SET status = $1, discharge_date = $2 WHERE mrn = $3 RETURNING *',
          ['Discharged', new Date().toISOString(), dischargeMRN]
        );
        await pgPool.query(
          'INSERT INTO medical_notes(patient_mrn, date, note, user) VALUES($1, $2, $3, $4)',
          [dischargeMRN, new Date().toISOString(), `Discharge notes: ${dischargeNotes}`, 'System']
        );
        await pgPool.query('COMMIT');
        // Update in Fauna as well
        await faunaClient.query(
          q.Update(
            q.Select('ref',
              q.Get(q.Match(q.Index('patients_by_mrn'), dischargeMRN))
            ),
            { data: dischargedPatient }
          )
        );
        return {
          statusCode: 200,
          body: JSON.stringify(dischargedPatient),
        };

      case method === 'GET' && path === '/specialties':
        // Fetch specialties from Postgres
        const { rows: specialties } = await pgPool.query('SELECT DISTINCT specialty FROM patients');
        return {
          statusCode: 200,
          body: JSON.stringify(specialties.map(row => row.specialty)),
        };

      default:
        return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
    }
  } catch (error) {
    console.error('Error in API:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};