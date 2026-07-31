import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID;

// Configuración de rutas estáticas absoluta
const root = process.cwd();
const distPath = path.join(root, 'dist');
console.log(`[Server] Root: ${root}`);
console.log(`[Server] Dist Path: ${distPath}`);

// 1. Servir archivos estáticos (JS, CSS, Imágenes)
// Lo servimos en la raíz y también en /RANGEL para mayor compatibilidad
app.use(express.static(distPath));
app.use('/RANGEL', express.static(distPath));

// GET /api/guest/:id - Obtener info del invitado
app.get('/api/guest/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`[Server] Intentando consultar Spreadsheet: ${spreadsheetId?.substring(0, 5)}...`);
    console.log(`[Server] Rango solicitado: 'INVITACIONES!A:Z'`);

    // Leemos la hoja
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITACIONES!A:Z', 
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ message: 'No hay datos' });

    // Buscamos el invitado por ID en la Columna J (índice 9)
    console.log(`[API] Solicitando ID: "${id}"`);
    
    const guestRow = rows.find(row => {
      const rowId = row[9] ? String(row[9]).trim() : "";
      return rowId === id;
    });

    if (!guestRow) {
      console.log(`[API] ❌ ID "${id}" no encontrado en ninguna fila.`);
      return res.status(404).json({ message: 'Invitado no encontrado' });
    }

    console.log(`[API] ✅ Fila encontrada (JSON):`, JSON.stringify(guestRow));

    const nombreFinal = guestRow[2] || guestRow[1] || "Invitado";

    res.json({
      id: guestRow[9],
      nombre: nombreFinal,
      integrantes: parseInt(guestRow[8]) || 1,
      estatus: guestRow[10],
      confirmados: guestRow[11] 
    });
  } catch (error: any) {
    console.error("❌ ERROR GOOGLE SHEETS API:", error.message);
    if (error.response) {
      console.error("DETALLE:", JSON.stringify(error.response.data));
    }
    res.status(500).json({ message: 'Error al consultar Google Sheets', detail: error.message });
  }
});

// POST /api/rsvp - Actualizar estatus y cantidad
app.post('/api/rsvp', async (req, res) => {
  try {
    const { id, status, guestCount } = req.body;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITACIONES!J:J', 
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ message: 'No hay datos' });

    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) return res.status(404).json({ message: 'Invitado no encontrado' });

    const realRowIndex = rowIndex + 1; 

    const finalStatus = status === 'Aceptado' ? 'Aceptada' : 'No aceptada';
    const finalCount = status === 'Aceptado' ? guestCount : 0;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `INVITACIONES!K${realRowIndex}:L${realRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[finalStatus, finalCount]],
      },
    });

    console.log(`[API] ✅ RSVP guardado para ID ${id}: ${finalStatus} (${finalCount} pers.)`);
    res.json({ message: 'RSVP guardado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar Google Sheets' });
  }
});

// Función para generar IDs de 6 caracteres (Evitando caracteres ambiguos)
function generateCustomId(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Función que revisa y asigna IDs a nuevos registros
async function autoProvisionIds() {
  try {
    console.log("[AutoID] 🔍 Escaneando hoja para nuevos registros sin ID...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITACIONES!B5:O500', 
    });

    const rows = response.data.values || [];
    const updates = [];
    const baseUrl = 'https://rangel-production.up.railway.app/RANGEL/';

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row[1]; // CAMBIO: Usamos Columna C (Nombre) en lugar de B
      let currentId = row[8]; // Columna J (index 8 relativo a B)
      const currentUrl = row[13]; // Columna O (index 13 relativo a B)
      const realRowIndex = i + 5;

      // Lógica robusta para detectar si falta el ID
      let needsUpdate = false;
      let idToUse = currentId;

      // Un ID válido debe existir, no ser solo espacios y tener longitud lógica (ej. 6)
      const isIdValid = idToUse && String(idToUse).trim().length === 6 && !String(idToUse).includes('+');

      if (name && name.trim() !== "" && !isIdValid) {
        idToUse = generateCustomId(6);
        needsUpdate = true;
        console.log(`[AutoID] ✨ Generando nuevo ID (${idToUse}) para: ${name}`);
      }

      // Verificamos si falta la URL o si no coincide con el ID
      const expectedUrl = idToUse ? `${baseUrl}?id=${idToUse}` : "";
      if (idToUse && (!currentUrl || currentUrl !== expectedUrl)) {
        needsUpdate = true;
      }

      if (needsUpdate && idToUse) {
        updates.push({
          range: `INVITACIONES!J${realRowIndex}`,
          values: [[idToUse]]
        });
        updates.push({
          range: `INVITACIONES!O${realRowIndex}`,
          values: [[expectedUrl]]
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
      console.log(`[AutoID] ✅ Se asignaron ${updates.length} IDs nuevos.`);
    } else {
      console.log("[AutoID] ℹ️ Todos los registros tienen ID.");
    }
  } catch (error: any) {
    console.error("[AutoID] ❌ Error en aprovisionamiento automático:", error.message);
  }
}

// Ejecutar cada 2 minutos (120,000 ms)
setInterval(autoProvisionIds, 2 * 60 * 1000);
// Ejecución inicial al arrancar el servidor
autoProvisionIds();

// Ruta catch-all para React (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} at 0.0.0.0`);
});
