import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID;

async function listIds() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITACIONES!J5:J100', 
    });
    const ids = response.data.values || [];
    console.log("--- IDs ENCONTRADOS EN COLUMNA J ---");
    ids.forEach((row, i) => {
      console.log(`Fila ${i + 5}: "${row[0]}"`);
    });
    console.log("-----------------------------------");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
listIds();
