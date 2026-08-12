# Sección "Mesa de Regalos" — Plan de Implementación

> **Para agentes de ejecución:** SUB-SKILL REQUERIDA: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan síntaxis con casillas (`- [ ]`) para seguimiento.

**Objetivo:** Agregar una sección "Mesa de Regalos" que solo se muestra cuando el invitado **aceptó** la invitación, con links de tiendas y datos bancarios con botón copiar.

**Arquitectura:** Refactor del estado de RSVP en `src/App.tsx` para distinguir "aceptó" de "declinó", y un nuevo sub-componente `GiftRegistry` renderizado condicionalmente dentro del bloque ya animado, siguiendo el patrón single-file existente.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS 4 + Framer Motion (`motion`) + `lucide-react`.

## Restricciones Globales

- Archivo único modificado: `src/App.tsx`. No se toca `server/`, `index.css`, ni `vite.config.ts`.
- Paleta existente: `cream`, `gold`, `gold-light`, `gold-dark`, `ink`. Tipografías `font-serif` (Cormorant Garamond) y `font-display` (Playfair Display).
- Curva de animación estándar: `ease: [0.16, 1, 0.3, 1]`.
- **No hay framework de tests en el proyecto.** Verificación = `npm run lint` (typecheck) + `npm run build` + revisión manual.
- Datos de tiendas y banco quedan como **placeholders** (a reemplazar por la pareja).
- El estado usa estos valores exactos (vienen de Google Sheets): `"Aceptada"` / `"No aceptada"` / `null`.

---

### Task 1: Refactor estado RSVP para distinguir aceptación

**Archivos:**
- Modify: `src/App.tsx:369-376` (declaraciones de estado), `:425-432` (carga inicial), `:443-467` (handleRSVP), `:807` (Editar Respuesta)

**Interfaces:**
- Consumes: nada (estado local existente).
- Produce: `rsvpStatus: null | 'Aceptada' | 'No aceptada'`, y derivados `isRSVPed: boolean` y `hasAccepted: boolean`. La Task 2 usa `hasAccepted`.

- [ ] **Step 1: Reemplazar la declaración de estado `isRSVPed`**

En `src/App.tsx`, dentro de `App()`, reemplaza la línea 369:

```tsx
  const [isRSVPed, setIsRSVPed] = useState(false);
```

por:

```tsx
  const [rsvpStatus, setRsvpStatus] = useState<null | 'Aceptada' | 'No aceptada'>(null);
  const isRSVPed = rsvpStatus !== null;          // "ya respondió"
  const hasAccepted = rsvpStatus === 'Aceptada'; // "aceptó" → gate de la nueva sección
```

- [ ] **Step 2: Actualizar la carga inicial (GET)**

En el `useEffect` de carga (líneas 425-432), reemplaza todo el bloque `if (data.estatus ...)`:

```tsx
            // Si ya tiene una respuesta guardada, cargamos el conteo y mostramos vista de éxito
            if (data.estatus === 'Aceptada' || data.estatus === 'No aceptada') {
              setRsvpStatus(data.estatus);
              if (data.confirmados !== undefined) setGuestCount(data.confirmados);
            } else {
              setGuestCount(data.integrantes); // Por defecto el máximo
            }
```

- [ ] **Step 3: Actualizar `handleRSVP`**

Dentro de `handleRSVP` (línea ~457), reemplaza `setIsRSVPed(true);` por:

```tsx
      setRsvpStatus(status === 'Aceptado' ? 'Aceptada' : 'No aceptada');
```

(El resto de `handleRSVP` queda igual.)

- [ ] **Step 4: Actualizar "Editar Respuesta"**

En el botón "Editar Respuesta" (línea 807), reemplaza `setIsRSVPed(false)` por:

```tsx
            onClick={() => setRsvpStatus(null)}
```

- [ ] **Step 5: Verificar typecheck**

Run: `npm run lint`
Expected: 0 errores de TypeScript (las referencias restantes a `isRSVPed` siguen válidas porque ahora es una variable derivada).

- [ ] **Step 6: Verificar build**

Run: `npm run build`
Expected: build exitoso, sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: distinguir estado de RSVP aceptado/declinado"
```

---

### Task 2: Crear componente `GiftRegistry` y renderizarlo condicionalmente

**Archivos:**
- Modify: `src/App.tsx:6-18` (imports), `:289` (antes de `WorksSection`), `:818` (después del section RSVP, antes del footer)

**Interfaces:**
- Consumes: `hasAccepted` (de Task 1), `motion` y `AnimatePresence` ya importados.
- Produce: componente `GiftRegistry` (self-contained, sin props).

- [ ] **Step 1: Agregar imports**

En el import de `lucide-react` (líneas 7-18), agrega `ShoppingBag`, `Gift`, `Copy`, `Check`:

```tsx
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  ShoppingBag,
  Gift,
  Copy,
  Check
} from "lucide-react";
```

Agrega el tipo `LucideIcon` justo después de ese import:

```tsx
import type { LucideIcon } from "lucide-react";
```

- [ ] **Step 2: Agregar constantes de datos**

Justo antes de la definición de `WorksSection` (línea ~289), agrega las constantes y el componente:

```tsx
// Datos de la Mesa de Regalos (a reemplazar por la pareja)
const giftStores: { nombre: string; url: string; icono: LucideIcon }[] = [
  { nombre: "Liverpool", url: "https://www.liverpool.com.mx/", icono: ShoppingBag },
  { nombre: "Amazon", url: "https://www.amazon.com.mx/", icono: Gift },
];

const bankData = {
  banco: "Banco",
  clabe: "000000000000000000", // 18 dígitos
  titular: "Titular de la cuenta",
};

// Componente: Mesa de Regalos
const GiftRegistry = () => {
  const [copied, setCopied] = useState(false);

  const copyClabe = async () => {
    try {
      await navigator.clipboard.writeText(bankData.clabe);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`CLABE: ${bankData.clabe}`);
    }
  };

  return (
    <section className="w-full mb-32">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-gold/30" />
            <span className="font-serif text-[10px] tracking-[0.6em] uppercase text-gold-dark italic">
              / Mesa de Regalos /
            </span>
            <div className="w-12 h-[1px] bg-gold/30" />
          </div>
          <p className="font-serif text-lg text-ink/70 italic max-w-md">
            Su presencia es el mejor regalo, pero si desean obsequiarnos algo más, aquí tienen algunas opciones.
          </p>
        </div>

        {/* Parte 1: Mesas en tiendas */}
        <div className="mb-10">
          <div className="gold-border p-6 md:p-10 bg-white rounded-3xl shadow-xl">
            <h4 className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mb-8 text-center">
              Mesas en Tiendas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {giftStores.map((store) => (
                <a
                  key={store.nombre}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-4 border border-gold/10 rounded-2xl p-8 bg-white/50 hover:bg-gold/5 transition-all duration-500 shadow-sm"
                >
                  <div className="p-4 rounded-full bg-gold/10 group-hover:bg-gold/20 transition-colors">
                    <store.icono className="text-gold-dark" size={28} strokeWidth={1} />
                  </div>
                  <span className="font-display text-2xl italic text-ink">{store.nombre}</span>
                  <span className="font-serif text-xs tracking-[0.3em] uppercase text-gold-dark group-hover:text-ink transition-colors">
                    Ver mesa →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Parte 2: Datos bancarios */}
        <div>
          <div className="gold-border p-6 md:p-10 bg-white rounded-3xl shadow-xl text-center">
            <h4 className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mb-8">
              Transferencia
            </h4>
            <div className="flex flex-col items-center gap-2 mb-8">
              <p className="font-serif text-sm text-ink/70 uppercase tracking-widest">{bankData.banco}</p>
              <p className="font-display text-2xl md:text-3xl italic text-ink tracking-[0.06em]">{bankData.clabe}</p>
              <p className="font-serif text-sm text-ink/70 italic">{bankData.titular}</p>
            </div>
            <button
              onClick={copyClabe}
              className={`inline-flex items-center gap-3 rounded-full px-8 py-4 font-serif text-xs tracking-[0.3em] uppercase transition-all duration-500 active:scale-95 ${
                copied
                  ? "bg-gold-dark text-cream"
                  : "bg-ink text-cream hover:bg-gold-dark"
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copiada" : "Copiar CLABE"}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
```

- [ ] **Step 3: Renderizar condicionalmente**

Dentro del bloque gated de `AnimatePresence` en `App()` (el que ya depende de `isInfoCompleted`), justo después del cierre del `<section>` del RSVP (línea 817) y **antes** del `<footer>` (línea 819), agrega:

```tsx
              {/* Mesa de Regalos - solo visible si el invitado aceptó */}
              {hasAccepted && <GiftRegistry />}
```

- [ ] **Step 4: Verificar typecheck**

Run: `npm run lint`
Expected: 0 errores de TypeScript.

- [ ] **Step 5: Verificar build**

Run: `npm run build`
Expected: build exitoso.

- [ ] **Step 6: Verificación manual (dev)**

Run: `npm run dev` y abre la página con un `?id=<id test>` cuya fila tenga `estatus` vacío.
- Confirmar que la sección **NO** aparece antes de responder ni al declinar.
- Aceptar con gusto → confirmar que **Mesa de Regalos** aparece debajo del RSVP con tiendas + datos bancarios.
- Probar botón "Copiar CLABE" → cambia a "✓ Copiada" por 2s.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: sección Mesa de Regalos visible tras aceptar invitación"
```