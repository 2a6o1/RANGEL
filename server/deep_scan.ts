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

async function deepScan() {
  const targetId = "SE457U";
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'INVITACIONES!A1:N10',
  });
  const rows = response.data.values || [];
  const guestRow = rows.find(row => row[9] === targetId);

  if (guestRow) {
    console.log("FILA COMPLETA ENCONTRADA:");
    guestRow.forEach((val, idx) => {
      const letter = String.fromCharCode(65 + idx);
      console.log(`Col ${letter} (idx ${idx}): "${val || '[VACIO]'}"`);
    });
  } else {
    console.log("No se encontró el ID SE457U");
  }
}
deepScan();
