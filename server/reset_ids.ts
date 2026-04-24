import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

function generateCustomId(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID;

async function resetAllIds() {
  try {
    console.log("🧹 Iniciando reseteo total de IDs en Columna J...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITADOS!A5:J200', 
    });

    const rows = (response.data.values || []) as string[][];
    const updates = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = row[1]; // Columna B
        if (name) {
            const newId = generateCustomId(6);
            updates.push({
                range: `INVITADOS!J${i + 5}`,
                values: [[newId]]
            });
        }
    }

    if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            requestBody: {
                data: updates,
                valueInputOption: 'USER_ENTERED'
            }
        });
        console.log(`✅ ¡ÉXITO! Se han regenerado ${updates.length} IDs con el nuevo formato.`);
    }

  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
  }
}

resetAllIds();
