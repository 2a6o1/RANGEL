import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

let privateKey = process.env.GOOGLE_PRIVATE_KEY;
console.log("Tipo de privateKey:", typeof privateKey);
if (privateKey) {
    console.log("Longitud original:", privateKey.length);
    privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    console.log("Longitud procesada:", privateKey.length);
    console.log("Primeros 30 caracteres:", privateKey.substring(0, 30));
}

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  privateKey,
  ['https://www.googleapis.com/auth/spreadsheets']
);

async function check() {
  try {
    const token = await auth.authorize();
    console.log("✅ AUTORIZADO! Token type:", token.token_type);
    
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.SPREADSHEET_ID });
    console.log("✅ CONEXION EXITOSA. Sheet:", res.data.properties.title);
  } catch (e) {
    console.error("❌ ERROR FINAL:", e.message);
  }
}
check();
