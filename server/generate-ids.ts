import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// Lista de ejemplo - Puedes editar esto con tus invitados
const invitados = [
  { nombre: "Leticia Pérez", parentesco: "Mamá", integrantes: 1 },
  { nombre: "Rita Hernandez", parentesco: "Abuela", integrantes: 1 },
  // Añade más aquí...
];

function generateCSV() {
  const header = "ID (URL),Nombre,Parentesco,Integrantes,Estatus,Confirmados\n";
  const rows = invitados.map(inv => {
    const id = uuidv4().slice(0, 8); // ID corto para la URL
    return `${id},${inv.nombre},${inv.parentesco},${inv.integrantes},Pendiente,0`;
  }).join('\n');

  fs.writeFileSync('invitados_generados.csv', header + rows);
  console.log("✅ Archivo 'invitados_generados.csv' creado con éxito.");
  console.log("👉 Súbelo a Google Sheets para empezar.");
}

generateCSV();
