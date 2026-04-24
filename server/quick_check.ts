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

async function checkFirst() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'INVITADOS!A5:J10', 
  });
  const rows = response.data.values || [];
  rows.forEach((row, i) => {
    console.log(`FILA_${i+5}: ID=[${row[9]}] NOMBRE=[${row[1]}] DISPLAY=[${row[2]}]`);
  });
}
checkFirst();
