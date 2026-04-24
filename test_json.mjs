import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

async function testWithJson() {
  console.log("Probando conexión usando credentials.json...");
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.SPREADSHEET_ID });
    console.log(`✅ EXITO TOTAL! Sheet: ${res.data.properties.title}`);
    console.log("Pestañas encontradas:", res.data.sheets.map(s => s.properties.title).join(', '));
  } catch (e) {
    console.error(`❌ ERROR: ${e.message}`);
  }
}
testWithJson();
