/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "motion/react";
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
  Music
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

// Componente para las imágenes flotantes de fondo
const FloatingBackground = () => {
  const images = ["imgs/autofoto.png", "imgs/bodaMuppet.png", "imgs/pose2.png", "imgs/resale.png"];
  const [items, setItems] = React.useState<{ id: number, src: string, x: number, y: number, size: number }[]>([]);

  React.useEffect(() => {
    const createItem = (excludeSrcs: string[] = []) => {
      const availableImages = images.filter(img => !excludeSrcs.includes(img));
      const chosenSrc = availableImages.length > 0
        ? availableImages[Math.floor(Math.random() * availableImages.length)]
        : images[Math.floor(Math.random() * images.length)];

      return {
        id: Math.random(),
        src: chosenSrc,
        x: Math.random() * 70 + 5,
        y: Math.random() * 70 + 5,
        size: Math.random() * 200 + 400
      };
    };

    // Inicializar con 3 imágenes distintas
    const first = createItem();
    const second = createItem([first.src]);
    const third = createItem([first.src, second.src]);
    setItems([first, second, third]);

    const interval = setInterval(() => {
      setItems(prev => {
        const next = [...prev];
        next.shift();
        const currentSrcs = next.map(i => i.src);
        next.push(createItem(currentSrcs));
        return next;
      });
    }, 7000); // Un poco más lento para disfrutar el tamaño

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(4px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.size,
              height: item.size,
              backgroundImage: `url(${item.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              maskImage: 'radial-gradient(circle, black 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Componente para cada unidad de tiempo (Días, Horas, etc.)
// Movido fuera para evitar re-montajes innecesarios y asegurar que solo el número que cambia se anime
const TimeUnit = ({ label, value }: { label: string, value: number }) => (
  <div className="flex flex-col items-center min-w-[70px] md:min-w-[90px]">
    <div className="relative h-14 w-full flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for extra smoothness
            opacity: { duration: 0.4 }
          }}
          className="block font-display text-4xl md:text-6xl text-ink"
        >
          {value.toString().padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mt-3 opacity-70">
      {label}
    </span>
  </div>
);

// Componente elegante para la cuenta regresiva
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-12-26T16:00:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(prev => {
          // Solo actualizamos si algo cambió para mayor eficiencia (aunque React lo hace solo en objetos)
          if (prev.days === d && prev.hours === h && prev.minutes === m && prev.seconds === s) return prev;
          return { days: d, hours: h, minutes: m, seconds: s };
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5 }}
      className="w-full flex justify-center items-center gap-1 md:gap-3 py-6"
    >
      <TimeUnit label="Días" value={timeLeft.days} />
      <div className="w-[1px] h-10 bg-gold/20 mt-[-20px] mx-1" />
      <TimeUnit label="Horas" value={timeLeft.hours} />
      <div className="w-[1px] h-10 bg-gold/20 mt-[-20px] mx-1" />
      <TimeUnit label="Minutos" value={timeLeft.minutes} />
      <div className="w-[1px] h-10 bg-gold/20 mt-[-20px] mx-1" />
      <TimeUnit label="Segundos" value={timeLeft.seconds} />
    </motion.div>
  );
};

// Nuevo Componente: Mago de Información (Mini Cartas)
const InfoWizard = ({ onComplete, isCompleted }: { onComplete: () => void, isCompleted: boolean }) => {
  const [step, setStep] = useState(0);

  // Definición de los pasos solicitados
  const steps = [
    {
      title: "La Fecha",
      icon: <Calendar className="text-gold-dark" size={32} strokeWidth={1} />,
      content: (
        <div className="flex flex-col items-center text-center">
          <p className="font-display text-4xl mb-2 text-ink">26 Diciembre</p>
          <p className="font-serif text-xl uppercase tracking-[0.2em] text-gold-dark italic">Sábado • 2026</p>
        </div>
      ),
      button: "Continuar"
    },
    {
      title: "Itinerario",
      icon: <Clock className="text-gold-dark" size={32} strokeWidth={1} />,
      content: (
        <div className="w-full space-y-4">
          <div className="border-l-2 border-gold/20 pl-4 py-0.5">
            <p className="font-serif text-[10px] text-gold-dark tracking-widest uppercase">3:00 PM • Ceremonia</p>
            <p className="font-display text-base">Catedral Basílica Metropolitana</p>
          </div>
          <div className="border-l-2 border-gold/20 pl-4 py-0.5">
            <p className="font-serif text-[10px] text-gold-dark tracking-widest uppercase">4:30 PM • Recepción</p>
            <p className="font-display text-base">Jardín Cisneros</p>
          </div>
          <div className="border-l-2 border-gold/20 pl-4 py-0.5">
            <p className="font-serif text-[10px] text-gold-dark tracking-widest uppercase">5:00 PM • Banquete</p>
            <p className="font-display text-base">Comida y Celebración</p>
          </div>
        </div>
      ),
      button: "Siguiente"
    },
    {
      title: "Dress Code",
      icon: <Heart className="text-gold-dark" size={32} strokeWidth={1} />,
      content: (
        <div className="flex flex-col items-center text-center">
          <p className="font-display text-3xl mb-3 italic">Formal / Cocktail</p>
          <div className="w-10 h-[1px] bg-gold/30 mb-4" />
          <p className="font-serif text-sm text-ink/80 leading-relaxed italic">
            Recomendamos calzado cómodo para jardín.
          </p>
        </div>
      ),
      button: "Continuar"
    }
  ];

  if (isCompleted) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {steps.map((s, i) => (
          <div key={i} className="bg-white/50 backdrop-blur-sm border border-gold/10 p-8 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <div className="mb-4 opacity-50">{s.icon}</div>
            <h5 className="font-serif text-[10px] tracking-[0.3em] uppercase text-gold-dark mb-4">{s.title}</h5>
            <div className="scale-90">{s.content}</div>
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-col items-center opacity-40">
        <Sparkles size={16} className="text-gold mb-2" />
        <span className="font-serif text-[9px] tracking-[0.5em] uppercase">Información Confirmada</span>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="gold-border p-8 md:p-12 bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col items-center relative overflow-hidden"
        >
          <div className="mb-6 p-4 rounded-full bg-gold/5 flex items-center justify-center">
            {steps[step].icon}
          </div>

          <h4 className="font-serif text-[10px] tracking-[0.5em] uppercase text-gold-dark mb-8 text-center border-b border-gold/10 pb-2">
            {steps[step].title}
          </h4>

          <div className="mb-10 w-full flex flex-col items-center min-h-[180px] justify-center">
            {steps[step].content}
          </div>

          <button
            onClick={() => step < 2 ? setStep(step + 1) : onComplete()}
            className="group flex flex-col items-center gap-3 active:scale-95 transition-transform"
          >
            <span className="font-serif text-xs tracking-[0.4em] uppercase text-ink group-hover:text-gold-dark transition-colors">
              {steps[step].button}
            </span>
            <div className="w-10 h-[1px] bg-gold/30 group-hover:w-20 group-hover:bg-gold-dark transition-all duration-500" />
          </button>

          <div className="absolute bottom-6 flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-gold' : 'bg-gold/20'}`} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Envelope flap rotation
  const flapRotation = useTransform(smoothProgress, [0, 0.12], [0, -180]);

  // Card sliding out
  const cardY = useTransform(smoothProgress, [0.08, 0.3], [0, -420]);
  const cardScale = useTransform(smoothProgress, [0.2, 0.4], [0.9, 1.05]);

  // Content - Delayed until envelope is gone, but remains "solid" (sharp transition)
  const contentOpacity = useTransform(smoothProgress, [0.4, 0.41], [0, 1]);
  const contentY = useTransform(smoothProgress, [0.4, 0.55], [100, 0]);

  // Envelope fade out/move - Handing off to the content
  const envelopeOpacity = useTransform(smoothProgress, [0.35, 0.4], [1, 0]);
  const envelopeScale = useTransform(smoothProgress, [0.35, 0.4], [1, 0.8]);

  // Dynamic Z-index for the card to move it in front of the flap after opening
  const cardZIndex = useTransform(smoothProgress, [0.08, 0.2], [10, 50]);

  const [isRSVPed, setIsRSVPed] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [maxGuests, setMaxGuests] = useState(2);
  const [guestName, setGuestName] = useState("[Nombre del Invitado]");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoCompleted, setIsInfoCompleted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  // Activar música al primer clic/interacción global para saltarse bloqueos de navegador
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isMusicPlaying) {
        setIsMusicPlaying(true);
      }
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('mousedown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isMusicPlaying]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setGuestId(id);
      setIsLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL || '';

      fetch(`${apiUrl}/api/guest/${id}`)
        .then(res => res.json())
        .then(data => {
          console.log("[Frontend] Datos recibidos:", data);
          if (data.nombre) {
            setGuestName(data.nombre);
            setMaxGuests(data.integrantes);

            // Si ya tiene una respuesta guardada, cargamos el conteo y mostramos vista de éxito
            if (data.estatus === 'Aceptada' || data.estatus === 'No aceptada') {
              setIsRSVPed(true);
              if (data.confirmados !== undefined) setGuestCount(data.confirmados);
            } else {
              setGuestCount(data.integrantes); // Por defecto el máximo
            }
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error cargando invitado:", err);
          setIsLoading(false);
        });
    }
  }, []);


  const handleRSVP = async (status: 'Aceptado' | 'Rechazado') => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setIsLoading(true);
    try {
      await fetch(`${apiUrl}/api/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: guestId,
          status,
          guestCount: status === 'Aceptado' ? guestCount : 0
        })
      });
      setIsRSVPed(true);
      if (status === 'Rechazado') {
        alert("Sentimos que no puedas asistir. ¡Gracias por avisarnos!");
      }
    } catch (err) {
      console.error("Error al confirmar:", err);
      alert("Hubo un error al guardar tu respuesta. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-[500vh] bg-cream">
      <FloatingBackground />
      {/* Sticky Envelope Container */}
      <div className="sticky top-0 h-screen w-full flex items-start justify-center pt-[32vh] overflow-hidden pointer-events-none">

        {/* The Envelope */}
        <motion.div
          style={{ opacity: envelopeOpacity, scale: envelopeScale }}
          className="relative w-[95%] max-w-lg aspect-[4/5] z-20"
        >
          {/* Back of Envelope */}
          <div className="absolute inset-0 bg-[#e8e2d6] border border-gold/20 shadow-md rounded-b-lg overflow-hidden">
            {/* Inner shadow/pocket effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />
          </div>

          <motion.div
            style={{
              y: cardY,
              scale: cardScale,
              zIndex: cardZIndex,
              backgroundImage: 'url("imgs/resale.png")',
              backgroundSize: '115% auto',
              backgroundPosition: 'center 25%'
            }}
            className="absolute inset-x-2 top-2 bottom-2 bg-white shadow-lg rounded-sm p-8 flex flex-col items-center justify-center text-center border border-gold/10 pointer-events-auto relative overflow-hidden"
          >
            {/* Overlay para legibilidad */}
            <div className="absolute inset-0 bg-cream/60 backdrop-blur-[1px] z-0" />

            <div className="relative z-10 flex flex-col items-center">
              <Heart className="text-gold-dark mb-6" size={32} fill="currentColor" />
              <h2 className="font-display text-4xl md:text-5xl mb-4 italic text-ink">Reserva la Fecha</h2>
              <div className="w-16 h-[1.5px] bg-gold/40 my-6" />
              <p className="font-serif text-2xl md:text-3xl tracking-[0.2em] uppercase mb-2 text-ink">Rosa & Alejandro</p>
              <p className="font-serif text-base text-gold-dark tracking-[0.4em] uppercase font-medium">26 de Diciembre, 2026</p>
            </div>
          </motion.div>

          {/* Front Flap (Top) */}
          <motion.div
            style={{ rotateX: flapRotation, transformOrigin: "top" }}
            className="absolute inset-x-0 top-0 h-1/2 bg-[#f2ede4] border-x border-t border-gold/20 shadow-sm z-30 rounded-t-lg flex items-end justify-center pb-4 perspective-1000"
          >
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
              <Heart className="text-gold" size={20} />
            </div>
          </motion.div>

          {/* Bottom/Side Flaps (Visual only) */}
          <div className="absolute inset-0 z-40 pointer-events-none">
            <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-md">
              <path d="M0 500 L200 250 L400 500" fill="#f2ede4" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.2" />
              <path d="M0 0 L200 250 L0 500" fill="#f2ede4" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.2" />
              <path d="M400 0 L200 250 L400 500" fill="#f2ede4" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.2" />
            </svg>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.5, 1], y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
          style={{ opacity: useTransform(smoothProgress, [0, 0.1], [1, 0]) }}
        >
          <span className="font-serif text-xs tracking-[0.2em] uppercase text-gold">Desliza para Abrir</span>
          <ChevronDown className="text-gold" size={20} />
        </motion.div>
      </div>

      {/* Spacer to allow envelope section to fully animate */}
      <div className="h-[150vh]" />

      {/* Main Content Section */}
      <motion.main
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-50 w-full max-w-3xl mx-auto px-6 pb-32 pt-[100vh] flex flex-col items-center"
      >
        {/* Formal Header */}
        <header className="mb-24 text-center w-full">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-24 h-[1px] bg-gold/40 mx-auto mb-8"
          />
          <p className="font-serif italic text-xl text-gold-dark mb-6 tracking-wide">Junto a sus familias</p>
          <div className="relative inline-block mb-8">
            <h1 className="font-display text-6xl md:text-8xl leading-tight tracking-tighter">
              Rosa Rodriguez <br />
              <span className="text-gold italic font-serif text-4xl md:text-5xl block my-2">&</span>
              Alejandro Estrada
            </h1>
          </div>
          <p className="font-serif text-xl md:text-2xl tracking-[0.2em] uppercase text-ink max-w-md mx-auto leading-relaxed">
            Tienen el honor de invitarle a la celebración de su boda.
          </p>
        </header>

        {/* Guest Section - More "Solid" Card */}
        <div className="mb-24 w-full">
          <div className="gold-border p-1 bg-white rounded-lg shadow-2xl">
            <div className="border border-gold/20 p-10 md:p-16 text-center rounded-sm bg-white">
              <p className="font-serif text-xs tracking-[0.4em] uppercase text-gold-dark mb-6">Invitado Especial</p>
              <h3 className="font-display text-4xl md:text-5xl italic mb-6">
                {isLoading ? "Cargando..." : guestName}
              </h3>
              <div className="w-12 h-[1px] bg-gold/40 mx-auto mb-6" />
              <p className="font-serif text-lg text-ink italic leading-relaxed max-w-sm mx-auto">
                "Su presencia es el mejor regalo que podríamos recibir. Esperamos compartir este gran momento con usted."
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer Section */}
        <div className="mb-24 w-full flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8"
          >
            <Sparkles className="text-gold/60" size={24} strokeWidth={1} />
          </motion.div>

          <h4 className="font-serif text-[10px] tracking-[0.5em] uppercase text-gold-dark mb-10 text-center">
            Faltan solo
          </h4>

          <CountdownTimer />

          <div className="mt-12 flex flex-col items-center">
            <div className="w-24 h-[0.5px] bg-gradient-to-r from-transparent via-gold to-transparent" />
            <p className="font-serif italic text-gold-dark mt-4 text-sm tracking-widest">Para nuestro gran encuentro</p>
          </div>
        </div>

        {/* Info Wizard Section (Date, Itinerary, Dress Code) */}
        <section className="w-full mb-32">
          <InfoWizard onComplete={() => setIsInfoCompleted(true)} isCompleted={isInfoCompleted} />
        </section>

        {/* Gated Sections: Only visible after completing the Wizard */}
        <AnimatePresence>
          {isInfoCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full flex flex-col items-center"
            >
              {/* Locations Section (Church & Reception) */}
              <section className="mb-24 w-full text-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 w-full">

                  {/* Church Section */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <div className="inline-block p-3 rounded-full bg-gold/10 mb-6">
                      <MapPin className="text-gold-dark" size={28} strokeWidth={1} />
                    </div>
                    <h4 className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mb-4">La Ceremonia</h4>
                    <h3 className="font-display text-3xl md:text-4xl mb-4 italic">Catedral Basílica Metropolitana</h3>
                    <p className="font-serif text-base mb-8 max-w-xs mx-auto leading-relaxed text-ink opacity-80">
                      Álvaro Obregón 112, Centro <br />
                      León de los Aldama, Gto.
                    </p>

                    <div className="relative p-2 bg-white shadow-xl rounded-2xl border border-gold/10 w-full mb-8">
                      <div className="w-full aspect-video rounded-xl overflow-hidden bg-neutral-100 relative">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14885.759664539823!2d-101.68426000000001!3d21.1238899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842bbf0c92a59605%3A0xf9567ed0dd2be656!2sCatedral%20-%20Bas%C3%ADlica%20Metropolitana%20de%20Nuestra%20Madre%20Sant%C3%ADsima%20de%20la%20Luz!5e0!3m2!1ses!2smx!4v1711311000000!5m2!1ses!2smx"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={true}
                          loading="lazy"
                          className="grayscale contrast-125 brightness-95 hover:grayscale-0 transition-all duration-1000"
                        ></iframe>
                      </div>
                    </div>

                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Catedral+Bas%C3%ADlica+Metropolitana+de+Nuestra+Madre+Sant%C3%ADsima+de+la+Luz+León"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-xs tracking-[0.3em] uppercase text-gold-dark hover:text-ink transition-colors border border-gold/30 px-8 py-3 rounded-full"
                    >
                      ¿Cómo llegar?
                    </a>
                  </motion.div>

                  {/* Reception Section */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <div className="inline-block p-3 rounded-full bg-gold/10 mb-6">
                      <Sparkles className="text-gold-dark" size={28} strokeWidth={1} />
                    </div>
                    <h4 className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mb-4">La Fiesta</h4>
                    <h3 className="font-display text-3xl md:text-4xl mb-4 italic">Jardín Cisneros</h3>
                    <p className="font-serif text-base mb-8 max-w-xs mx-auto leading-relaxed text-ink opacity-80">
                      Camino Al Ojo de Agua <br />
                      San Pablo, Ibarrilla, León.
                    </p>

                    <div className="relative p-2 bg-white shadow-xl rounded-2xl border border-gold/10 w-full mb-8">
                      <div className="w-full aspect-video rounded-xl overflow-hidden bg-neutral-100 relative">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.088674!2d-101.641794!3d21.187226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842bb948f4bc397d%3A0xa53ef4c3f969caf2!2sJard%C3%ADn%20Cisneros!5e0!3m2!1ses!2smx!4v1711311000000!5m2!1ses!2smx"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={true}
                          loading="lazy"
                          className="grayscale contrast-125 brightness-95 hover:grayscale-0 transition-all duration-1000"
                        ></iframe>
                      </div>
                    </div>

                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Jardin+Cisneros+Leon+Guanajuato"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-xs tracking-[0.3em] uppercase text-gold-dark hover:text-ink transition-colors border border-gold/30 px-8 py-3 rounded-full"
                    >
                      ¿Cómo llegar?
                    </a>
                  </motion.div>

                </div>
              </section>

              {/* RSVP - Solid Action Card */}
              <section className="mb-32 w-full max-w-lg">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-3xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-white p-12 md:p-16 rounded-3xl shadow-2xl border border-gold/10 text-center">
                    {!isRSVPed ? (
                      <>
                        <MessageSquare className="text-gold mb-8 mx-auto" size={32} strokeWidth={1} />
                        <h3 className="font-display text-4xl mb-6 italic">Confirmar Asistencia</h3>
                        <p className="font-serif text-xl mb-10 text-ink leading-relaxed">
                          Le solicitamos amablemente su confirmación antes del primero de agosto.
                        </p>

                        {/* Guest Count Selector */}
                        <div className="mb-10 flex flex-col items-center gap-4">
                          <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold-dark">Invitados disponibles</p>
                          <div className="flex items-center gap-8">
                            <button
                              onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                              className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center text-gold-dark hover:bg-gold/5 transition-all active:scale-90"
                            >
                              <span className="text-2xl font-light">-</span>
                            </button>
                            <div className="flex flex-col items-center">
                              <span className="font-display text-4xl text-ink">{guestCount}</span>
                              <span className="text-[10px] uppercase tracking-widest text-gold/60 mt-1">
                                {guestCount === 1 ? 'Persona' : 'Personas'}
                              </span>
                            </div>
                            <button
                              onClick={() => setGuestCount(prev => Math.min(maxGuests, prev + 1))}
                              disabled={guestCount >= maxGuests}
                              className={`w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center text-gold-dark transition-all active:scale-90 ${guestCount >= maxGuests ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gold/5'}`}
                            >
                              <span className="text-2xl font-light">+</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <button
                            onClick={() => handleRSVP('Aceptado')}
                            className="w-full bg-ink text-cream font-serif tracking-[0.3em] uppercase py-5 rounded-full hover:bg-gold-dark transition-all duration-500 shadow-xl active:scale-[0.98] transform flex items-center justify-center gap-3"
                          >
                            <Heart size={18} fill="currentColor" />
                            Aceptar con Gusto
                          </button>
                          <button
                            onClick={() => handleRSVP('Rechazado')}
                            className="w-full py-4 text-ink/30 font-serif text-xs tracking-[0.3em] uppercase hover:text-ink transition-colors"
                          >
                            Declinar con Pesar
                          </button>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative py-12 px-6 overflow-hidden rounded-2xl min-h-[400px] flex flex-col items-center justify-center"
                      >
                        {/* Fondo con imagen nítida */}
                        <div
                          className="absolute inset-0 z-0 opacity-90"
                          style={{
                            backgroundImage: 'url("imgs/bodaMuppet.png")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'none'
                          }}
                        />

                        {/* Tarjeta de texto (Glassmorphism) para legibilidad */}
                        <div className="relative z-10 bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center max-w-[90%]">
                          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Heart className="text-gold-dark" size={32} fill="currentColor" />
                          </div>
                          <h3 className="font-display text-4xl mb-4 italic text-ink">¡Estás en la lista!</h3>
                          <p className="font-serif text-lg text-ink leading-relaxed text-center">
                            Hemos recibido la confirmación de {guestCount} {guestCount === 1 ? 'persona' : 'personas'}. <br />
                            Significa mucho para nosotros que nos acompañes.
                          </p>
                          <button
                            onClick={() => setIsRSVPed(false)}
                            className="mt-8 text-gold-dark font-serif text-[10px] tracking-[0.4em] uppercase hover:underline transition-all"
                          >
                            Editar Respuesta
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </section>

              <footer className="pb-20 text-center opacity-40">
                <div className="w-16 h-[1px] bg-gold mx-auto mb-10" />
                <p className="font-display text-3xl italic mb-4">Rosa & Alejandro</p>
                <p className="font-serif text-[10px] tracking-[0.5em] uppercase">León, Guanajuato • 2026</p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Music Control / Background Music */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <motion.button
          onClick={toggleMusic}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileActive={{ scale: 0.9 }}
          className="bg-white/40 backdrop-blur-md border border-gold/20 p-4 rounded-full shadow-2xl text-gold-dark relative group"
        >
          <AnimatePresence mode="wait">
            {isMusicPlaying ? (
              <motion.div
                key="playing"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
              >
                <Volume2 size={24} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-ping" />
              </motion.div>
            ) : (
              <motion.div
                key="muted"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
              >
                <VolumeX size={24} className="opacity-50" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-ink/80 text-cream text-[10px] tracking-widest uppercase px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isMusicPlaying ? "Pausar música" : "Reproducir música"}
          </div>
        </motion.button>
      </div>

      {/* Hidden YouTube Player */}
      {isMusicPlaying && (
        <div className="fixed -top-full -left-full opacity-0 pointer-events-none">
          <iframe
            width="200"
            height="200"
            src="https://www.youtube.com/embed/M-AMu_iAcf8?autoplay=1&loop=1&playlist=M-AMu_iAcf8"
            allow="autoplay"
            title="Background Music"
          ></iframe>
        </div>
      )}
    </div>
  );
}
