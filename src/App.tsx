/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { MapPin, Calendar, Clock, Heart, MessageSquare, ChevronDown } from "lucide-react";
import { useRef, useState, useEffect } from "react";

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
  const cardY = useTransform(smoothProgress, [0.08, 0.3], [0, -260]);
  const cardScale = useTransform(smoothProgress, [0.2, 0.4], [0.9, 1]);

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
  const maxGuests = 10;

  return (
    <div ref={containerRef} className="relative min-h-[500vh] bg-cream">
      {/* Sticky Envelope Container */}
      <div className="sticky top-0 h-screen w-full flex items-start justify-center pt-[32vh] overflow-hidden pointer-events-none">

        {/* The Envelope */}
        <motion.div
          style={{ opacity: envelopeOpacity, scale: envelopeScale }}
          className="relative w-[90%] max-w-md aspect-[4/3] z-20"
        >
          {/* Back of Envelope */}
          <div className="absolute inset-0 bg-[#e8e2d6] border border-gold/20 shadow-md rounded-b-lg overflow-hidden">
            {/* Inner shadow/pocket effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />
          </div>

          {/* The Invitation Card (Inside) */}
          <motion.div
            style={{ y: cardY, scale: cardScale, zIndex: cardZIndex }}
            className="absolute inset-x-4 top-4 bottom-4 bg-white shadow-lg rounded-sm p-8 flex flex-col items-center justify-center text-center border border-gold/10 pointer-events-auto"
          >
            <Heart className="text-gold mb-4" size={24} fill="currentColor" />
            <h2 className="font-display text-3xl mb-2 italic">Reserva la Fecha</h2>
            <div className="w-12 h-[1px] bg-gold/30 my-4" />
            <p className="font-serif text-xl tracking-widest uppercase mb-1">Rosa & Alejandro</p>
            <p className="font-serif text-sm text-gold tracking-widest uppercase">26 de Diciembre, 2026</p>
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
            <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-md">
              <path d="M0 300 L200 150 L400 300" fill="#f2ede4" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.2" />
              <path d="M0 0 L200 150 L0 300" fill="#f2ede4" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.2" />
              <path d="M400 0 L200 150 L400 300" fill="#f2ede4" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.2" />
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
              Rosa Gutierrez? <br />
              <span className="text-gold italic font-serif text-4xl md:text-5xl block my-2">&</span>
              Alejandro Estrada
            </h1>
          </div>
          <p className="font-serif text-xl md:text-2xl tracking-[0.2em] uppercase text-ink max-w-md mx-auto leading-relaxed">
            Tienen el honor de invitarle a la celebración de su boda
          </p>
        </header>

        {/* Guest Section - More "Solid" Card */}
        <div className="mb-24 w-full">
          <div className="gold-border p-1 bg-white rounded-lg shadow-2xl">
            <div className="border border-gold/20 p-10 md:p-16 text-center rounded-sm bg-white">
              <p className="font-serif text-xs tracking-[0.4em] uppercase text-gold-dark mb-6">Invitado Especial</p>
              <h3 className="font-display text-4xl md:text-5xl italic mb-6">Sr. y Sra. [Nombre del Invitado]</h3>
              <div className="w-12 h-[1px] bg-gold/40 mx-auto mb-6" />
              <p className="font-serif text-lg text-ink italic leading-relaxed max-w-sm mx-auto">
                "Su presencia es el mejor regalo que podríamos recibir. Esperamos compartir este gran momento con usted."
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time - Structured Grid */}
        <section className="w-full mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-gold/40">
            <div className="py-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gold/20 bg-white">
              <Calendar className="text-gold-dark mb-4" size={28} strokeWidth={1} />
              <h4 className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mb-3">La Fecha</h4>
              <p className="font-display text-2xl">26 Diciembre, 2026</p>
              <p className="font-serif text-sm uppercase tracking-widest mt-1">Sábado</p>
            </div>

            <div className="py-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gold/20 bg-white">
              <Clock className="text-gold-dark mb-4" size={28} strokeWidth={1} />
              <h4 className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mb-3">La Hora</h4>
              <p className="font-display text-2xl">4:00 PM</p>
              <p className="font-serif text-sm uppercase tracking-widest mt-1">Recepción a continuación</p>
            </div>

            <div className="py-12 flex flex-col items-center justify-center bg-white">
              <Heart className="text-gold-dark mb-4" size={28} strokeWidth={1} />
              <h4 className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mb-3">Vestimenta</h4>
              <p className="font-display text-2xl">Etiqueta</p>
              <p className="font-serif text-sm uppercase tracking-widest mt-1">Formal Opcional</p>
            </div>
          </div>
        </section>

        {/* Location - Solid Layout */}
        <section className="mb-24 w-full text-center">
          <div className="inline-block p-3 rounded-full bg-gold/10 mb-6">
            <MapPin className="text-gold-dark" size={28} strokeWidth={1} />
          </div>
          <h4 className="font-serif text-[10px] tracking-[0.4em] uppercase text-gold-dark mb-4">El Lugar</h4>
          <h3 className="font-display text-4xl md:text-5xl mb-6">The Playa Blanca</h3>
          <p className="font-serif text-xl mb-12 max-w-md mx-auto leading-relaxed text-ink">
            Punta Cancun, 92, 77516  <br />
            Cancún, Quintana Roo, México
          </p>

          {/* Map with Solid Frame */}
          <div className="relative p-2 bg-white shadow-2xl rounded-2xl border border-gold/10">
            <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden bg-neutral-100 relative">
              <iframe
                src="https://maps.app.goo.gl/S43BYiH72Hf4Fd7s6"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="grayscale contrast-125 brightness-95 hover:grayscale-0 transition-all duration-1000"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]" />
            </div>
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
                        className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center text-gold-dark hover:bg-gold/5 transition-all active:scale-90"
                      >
                        <span className="text-2xl font-light">+</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => setIsRSVPed(true)}
                      className="w-full bg-ink text-cream font-serif tracking-[0.3em] uppercase py-5 rounded-full hover:bg-gold-dark transition-all duration-500 shadow-xl active:scale-[0.98] transform flex items-center justify-center gap-3"
                    >
                      <Heart size={18} fill="currentColor" />
                      Aceptar con Gusto
                    </button>
                    <button className="w-full py-4 text-ink/30 font-serif text-xs tracking-[0.3em] uppercase hover:text-ink transition-colors">
                      Declinar con Pesar
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6"
                >
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Heart className="text-gold" size={40} fill="currentColor" />
                  </div>
                  <h3 className="font-display text-4xl mb-6 italic">¡Estás en la lista!</h3>
                  <p className="font-serif text-xl text-ink leading-relaxed">
                    Hemos recibido la confirmación de {guestCount} {guestCount === 1 ? 'persona' : 'personas'}. <br />
                    Significa mucho para nosotros que nos acompañes.
                  </p>
                  <button
                    onClick={() => setIsRSVPed(false)}
                    className="mt-12 text-gold font-serif text-[10px] tracking-[0.4em] uppercase hover:underline"
                  >
                    Editar Respuesta
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        <footer className="pb-20 text-center opacity-40">
          <div className="w-16 h-[1px] bg-gold mx-auto mb-10" />
          <p className="font-display text-3xl italic mb-4">Rosa & Alejandro</p>
          <p className="font-serif text-[10px] tracking-[0.5em] uppercase">Cancún, Quintana Roo • 2026</p>
        </footer>
      </motion.main>
    </div>
  );
}
