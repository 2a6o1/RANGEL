import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

let privateKey = process.env.GOOGLE_PRIVATE_KEY;
if (privateKey) {
    // Elimina comillas si existen al inicio y final
    privateKey = privateKey.replace(/^"|"$/g, '');
    // Reemplaza \n literales por saltos de línea reales
    privateKey = privateKey.replace(/\\n/g, '\n');
}

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  privateKey,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID;

async function test() {
  console.log("Probando conexión con Google Sheets...");
  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    console.log(`✅ CONEXIÓN EXITOSA!`);
    console.log(`Título: ${res.data.properties.title}`);
  } catch (e) {
    console.error(`❌ ERROR DE GOOGLE: ${e.message}`);
    if (e.message.includes('anonymous')) {
        console.log("👉 Google dice que no te has identificado. Revisa que el EMAIL del .env coincida exactamente con el que compartiste.");
    }
  }
}
test();
