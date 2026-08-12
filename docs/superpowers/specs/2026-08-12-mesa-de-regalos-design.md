# Diseño — Sección "Mesa de Regalos"

**Fecha:** 2026-08-12
**Proyecto:** Invitación de boda Rosa & Alejandro (RANGEL)

## Resumen

Agregar una sección **"Mesa de Regalos"** a la invitación digital. Se muestra **únicamente** cuando el invitado ha **aceptado** la invitación (no antes, ni si declinó). Sigue el esquema visual existente (crema, dorado, tinta; serif + display; animaciones `motion`).

## Estado

- El componente de esta sección se escribe en `src/App.tsx` (patrón single-file existente), junto a `WorksSection`/`InfoWizard`.
- Los datos de tiendas y banco se definen como constantes tipadas al inicio del componente, fáciles de editar.

## Requerimientos

1. La sección aparece solo cuando el invitado aceptó (`hasAccepted === true`).
2. Orden del contenido: **primero links de mesa de regalos en tiendas**, **después datos bancarios**.
3. Datos bancarios: una tarjeta única con banco, CLABE y titular, más botón "Copiar CLABE" con feedback visual (✓ Copiada).
4. Consistente con la paleta existente: `cream`, `gold`, `gold-dark`, `gold-light`, `ink`.

## Cambio de estado (refactor clave)

Hoy `isRSVPed: boolean` no distingue "aceptó" de "declinó" (se activa con ambos). Se refactoriza a un estado que cubre los 3 casos:

```ts
const [rsvpStatus, setRsvpStatus] = useState<null | 'Aceptada' | 'No aceptada'>(null);
const isRSVPed = rsvpStatus !== null;          // "ya respondió" (mantiene comportamiento actual)
const hasAccepted = rsvpStatus === 'Aceptada'; // "aceptó" ← gate de la nueva sección
```

- **Carga inicial (GET `/api/guest/:id`)**: la API ya devuelve `estatus` con `"Aceptada"` / `"No aceptada"` → `setRsvpStatus(data.estatus)` cuando ya existe una respuesta; si `estatus` es vacío, se queda en `null`.
- **`handleRSVP`**: botón "Aceptar con Gusto" → `setRsvpStatus('Aceptada')`; "Declinar con Pesar" → `setRsvpStatus('No aceptada')`.
- La vista de éxito del RSVP y "Editar Respuesta" siguen dependiendo de `isRSVPed` (sin cambio de comportamiento).

## Estructura de la sección

```
┌──────────────────────────────────────┐
│  ✦ / MESA DE REGALOS / ✦             │  header serif dorado
│  texto de introducción               │
│  ┌────────────────────────────────┐  │
│  │ PARTE 1 · MESAS EN TIENDAS     │  │
│  │ ┌──────────┐  ┌──────────┐     │  │  grid responsive de tarjetas-tienda
│  │ │ Liverpool │  │  Amazon  │ →  │  │  (icono + nombre + "Ver mesa")
│  │ └──────────┘  └──────────┘     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ PARTE 2 · TRANSFERENCIA        │  │
│  │  Banco · CLABE · Titular       │  │
│  │  [ 📋 Copiar CLABE ]  ✓        │  │  botón copiar con feedback
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Componente `GiftRegistry`

- Función `GiftRegistry` declarada en `App.tsx` (patrón de los otros sub-componentes).
- Se renderiza dentro del bloque gated de `AnimatePresence` (el mismo que contiene Ubicaciones/RSVP), **después** del section RSVP y **antes** del `<footer>`.
- Condición: `{hasAccepted && (<GiftRegistry />)}` dentro del bloque que ya requiere `isInfoCompleted`.

### Parte 1 — Mesas en tiendas

- Array tipado: `{ nombre: string; url: string; icono: LucideIcon }[]`.
- Defaults: **Liverpool** y **Amazon** (URLs placeholder a reemplazar por la pareja).
- Cada tarjeta: icono lucide (`ShoppingBag` / `Gift`), nombre, botón/ancla "Ver mesa" que abre `url` en pestaña nueva (`target="_blank" rel="noopener noreferrer"`).
- Grid: `grid grid-cols-1 md:grid-cols-2 gap-6`.

### Parte 2 — Datos bancarios

- Tarjeta única con 3 campos: **Banco**, **CLABE**, **Titular** (valores placeholder en constantes).
- Botón "Copiar CLABE":
  - `navigator.clipboard.writeText(clabe)`.
  - Feedback: estado local `copied` → el texto del botón cambia a "✓ Copiada" por 2s (`setTimeout`).
  - Fallback si clipboard no está disponible: `alert` con la CLABE para copiado manual.

## Estilo (consistente con el esquema existente)

- Fondo de tarjetas: `bg-white/50 backdrop-blur-sm border border-gold/10 rounded-2xl` (igual que wizard completado).
- Header: separadores dorados (`w-12 h-[1px] bg-gold/30`) + `font-serif text-[10px] tracking-[0.6em] uppercase text-gold-dark italic` (patrón `/ RANGEL / INVPIX /`).
- Títulos: `font-display` con gradiente dorado opcional.
- Animaciones `motion`: `whileInView` con `ease: [0.16, 1, 0.3, 1]`.
- Sin cambios en `index.css` ni en `server/index.ts`.

## Datos placeholder (a reemplazar por la pareja)

```ts
const giftStores = [
  { nombre: "Liverpool", url: "https://www.liverpool.com.mx/", icono: ShoppingBag },
  { nombre: "Amazon",    url: "https://www.amazon.com.mx/",    icono: Gift },
];
const bankData = {
  banco: "Banco",
  clabe: "000000000000000000", // 18 dígitos
  titular: "Titular de la cuenta",
};
```

## Fuera de alcance

- Cambios en backend o en Google Sheets.
- Cambios en `index.css` (no se requieren nuevas clases).
- Múltiples cuentas bancarias (solo una, según elección del usuario).
