# Patient Admission Management System

This project is a Patient Admission Management System built with Express.js for the backend, using PostgreSQL as the database.

## Deployment Instructions (Heroku)

1. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```

2. Set the DATABASE_URL environment variable:
   ```
   heroku config:set DATABASE_URL=postgres://udm4cvai4s3kuk:p294caa4166f70570c0e7521dd131fa88bc00011a18e898b94cc2119e1daade45@cc0gj7hsrh0ht8.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d13r920bbftcop
   ```

3. Deploy the backend:
   ```
   git push heroku main
   ```

4. Open the app:
   ```
   heroku open
   ```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the necessary environment variables (DATABASE_URL)
4. Run the backend: `npm run dev`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Port for the backend server (default: 5000)

## API Endpoints

- GET /api/patients: Get all patients
- POST /api/patients: Add a new patient
- PUT /api/patients/:mrn: Update a patient
- GET /api/patients/:mrn/notes: Get notes for a patient
- POST /api/notes: Add a new note
- POST /api/patients/:mrn/discharge: Discharge a patient
- GET /api/specialties: Get all specialties