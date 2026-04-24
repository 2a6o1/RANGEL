import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

let privateKey = process.env.GOOGLE_PRIVATE_KEY;
if (privateKey) {
    privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
}

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  privateKey,
  ['https://www.googleapis.com/auth/spreadsheets']
);

async function checkToken() {
  try {
    console.log("Obteniendo token de acceso...");
    const token = await auth.getAccessToken();
    console.log("✅ Token obtenido con éxito. Longitud:", token.token?.length);
    console.log("Email usado:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    
    const sheets = google.sheets({ version: 'v4', auth });
    console.log("Consultando metadatos del sheet...");
    const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.SPREADSHEET_ID });
    console.log(`✅ EXITO TOTAL! Sheet: ${res.data.properties.title}`);
  } catch (e) {
    console.error(`❌ ERROR: ${e.message}`);
    if (e.stack) console.error(e.stack);
  }
}
checkToken();
