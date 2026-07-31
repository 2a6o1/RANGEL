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

async function checkId() {
  const targetId = "4cc868";
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'INVITACIONES!A1:J200', 
  });
  const rows = response.data.values || [];
  const guestRow = rows.find(row => row[9] === targetId);
  
  if (guestRow) {
    console.log(`✅ ID Encontrado!`);
    console.log(`Nombre (Col B): ${guestRow[1]}`);
    console.log(`Nombre personalizado (Col C): ${guestRow[2]}`);
  } else {
    console.log(`❌ ID ${targetId} no encontrado en la Columna J.`);
  }
}
checkId();
