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

// GET /api/guest/:id - Obtener info del invitado
app.get('/api/guest/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Leemos la hoja (Incluyendo hasta la columna Z para asegurar captar el ID en J)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITADOS!A:Z', 
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

    // El nombre suele estar en B (1), C (2) o D (3)
    const nombreFinal = guestRow[1] || guestRow[2] || guestRow[3] || "Invitado";

    res.json({
      id: guestRow[9],
      nombre: guestRow[2] || guestRow[1] || "Invitado",
      integrantes: parseInt(guestRow[8]) || 1, // Columna I (índice 8) es el máximo de invitados
      estatus: guestRow[10],
      confirmados: guestRow[11] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al consultar Google Sheets' });
  }
});

// POST /api/rsvp - Actualizar estatus y cantidad
app.post('/api/rsvp', async (req, res) => {
  try {
    const { id, status, guestCount } = req.body;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'INVITADOS!J:J', // Buscamos en la columna J
    });

    const rows = response.data.values;
    if (!rows) return res.status(404).json({ message: 'No hay datos' });

    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) return res.status(404).json({ message: 'Invitado no encontrado' });

    const realRowIndex = rowIndex + 1; 

    // Determinamos texto de estatus y cantidad
    const finalStatus = status === 'Aceptado' ? 'Aceptada' : 'No aceptada';
    const finalCount = status === 'Aceptado' ? guestCount : 0;

    // Actualizamos Estatus (Columna K - índice 10) y Confirmados (Columna L - índice 11)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `INVITADOS!K${realRowIndex}:L${realRowIndex}`,
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

// Servir archivos estáticos de React (Carpeta Dist)
app.use(express.static(path.join(__dirname, '../dist')));

// Ruta catch-all para React (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
