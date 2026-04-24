import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID;

async function test() {
  console.log("Iniciando prueba de conexión...");
  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    console.log(`✅ CONEXIÓN EXITOSA. Título del Sheet: ${res.data.properties.title}`);
  } catch (e) {
    console.error(`❌ ERROR: ${e.message}`);
  }
}
test();
