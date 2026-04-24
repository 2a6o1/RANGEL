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

async function debug() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITADOS!A1:H5',
    });

    const rows = response.data.values || [];
    rows.forEach((row, i) => {
      console.log(`R${i}:${row.map(c => c || '[NULL]').join('|')}`);
    });
  } catch (error) {
    console.error("E:" + error.message);
  }
}

debug();
