import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID;

function generateCustomId(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Evitamos O, 0, I, 1 para evitar confusión
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function provisionJ() {
  try {
    console.log("🔍 Escaneando columna J en INVITACIONES (desde fila 5)...");
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITACIONES!A1:J500', 
    });

    const rows = (response.data.values || []) as string[][];
    const updates = [];

    for (let i = 4; i < rows.length; i++) {
        const row = rows[i];
        const name = row[1];
        const currentIdInJ = row[9];

        if (name && (!currentIdInJ || currentIdInJ.trim() === "" || currentIdInJ.includes('+'))) {
            const newId = generateCustomId(6);
            updates.push({
                range: `INVITACIONES!J${i + 1}`,
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
        console.log(`✅ ¡ÉXITO! Se generaron ${updates.length} IDs en la Columna J (desde J5).`);
    } else {
        console.log("ℹ️ No se encontraron filas nuevas que necesiten ID en la Columna J.");
    }

  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
  }
}

provisionJ();
