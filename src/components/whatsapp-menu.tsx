"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown, Send } from "lucide-react";

interface Template {
  label: string;
  message: string;
}

interface WhatsAppMenuProps {
  phone: string;
  templates: Template[];
  className?: string;
}

export function WhatsAppMenu({ phone, templates, className = "" }: WhatsAppMenuProps) {
  const [open, setOpen] = useState(false);

  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return null;

  const sendMessage = (message: string) => {
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-600/15 text-green-400 border border-green-600/20 hover:bg-green-600/25 transition-colors">
        <MessageCircle size={12} /> WhatsApp <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
            <p className="text-[10px] text-gray-500 px-3 pt-2 pb-1">Mensajes predefinidos</p>
            {templates.map((t, i) => (
              <button key={i} onClick={() => sendMessage(t.message)}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-2 border-t border-gray-800/50">
                <Send size={10} className="text-green-400 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
            <button onClick={() => sendMessage("")}
              className="w-full text-left px-3 py-2 text-xs text-green-400 hover:bg-gray-700/50 transition-colors flex items-center gap-2 border-t border-gray-800/50">
              <MessageCircle size={10} className="shrink-0" /> Mensaje libre
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Pre-built template generators
export const TEMPLATES = {
  paymentReminder: (clientName: string, amount: string, period: string, property: string): Template => ({
    label: `Recordatorio pago ${period}`,
    message: `Hola ${clientName}, le recordamos que tiene un pago pendiente de ${amount} correspondiente al período ${period} de ${property}. Quedo a disposición para coordinar.`,
  }),
  visitConfirmation: (clientName: string, property: string, date: string, time: string): Template => ({
    label: "Confirmar visita",
    message: `Hola ${clientName}, le confirmo la visita a ${property} el ${date}${time ? ` a las ${time}` : ""}. ¿Puede confirmarme su asistencia? Gracias.`,
  }),
  newProperty: (clientName: string, property: string, price: string, zone: string): Template => ({
    label: "Nueva propiedad disponible",
    message: `Hola ${clientName}, tenemos una nueva propiedad que podría interesarle: ${property} en ${zone} por ${price}. ¿Le gustaría coordinar una visita?`,
  }),
  contractRenewal: (clientName: string, property: string, endDate: string): Template => ({
    label: "Renovación de contrato",
    message: `Hola ${clientName}, su contrato de ${property} vence el ${endDate}. Nos gustaría coordinar una reunión para hablar sobre la renovación. ¿Cuándo le queda cómodo?`,
  }),
  ownerReport: (ownerName: string, month: string): Template => ({
    label: "Liquidación mensual",
    message: `Hola ${ownerName}, le envío la liquidación del mes de ${month}. Puede revisarla en el sistema. Cualquier duda quedo a disposición.`,
  }),
  welcomeClient: (clientName: string): Template => ({
    label: "Bienvenida",
    message: `Hola ${clientName}, bienvenido/a a nuestra inmobiliaria. Vamos a trabajar para encontrar la propiedad ideal para usted. ¿Podría contarme más sobre lo que busca?`,
  }),
};
