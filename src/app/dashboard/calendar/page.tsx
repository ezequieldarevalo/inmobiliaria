"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  type: string;
  status: string;
  property?: { title: string; street: string | null; streetNumber: string | null } | null;
  client?: { firstName: string; lastName: string } | null;
}

interface PaymentEvent {
  id: string;
  period: string;
  dueDate: string;
  amount: number;
  status: string;
  contract: { property: { title: string }; client: { firstName: string; lastName: string } };
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TYPE_COLORS: Record<string, string> = {
  VISITA: "bg-cyan-500", FIRMA: "bg-purple-500", ENTREGA_LLAVES: "bg-yellow-500",
  TASACION: "bg-orange-500", REUNION: "bg-blue-500", PAGO: "bg-emerald-500", VENCIDO: "bg-red-500",
};

const TYPE_LABELS: Record<string, string> = {
  VISITA: "Visita", FIRMA: "Firma", ENTREGA_LLAVES: "Entrega de llaves",
  TASACION: "Tasación", REUNION: "Reunión",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<CalendarEvent[]>([]);
  const [payments, setPayments] = useState<PaymentEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetch("/api/appointments").then((r) => r.json()).then((d) => Array.isArray(d) && setAppointments(d)).catch(() => {});
    fetch("/api/payments").then((r) => r.json()).then((d) => Array.isArray(d) && setPayments(d)).catch(() => {});
  }, []);

  const allEvents = useMemo(() => {
    const events: { date: string; type: string; color: string; title: string; detail: string; time?: string | null }[] = [];

    appointments.forEach((a) => {
      const d = new Date(a.date).toISOString().split("T")[0];
      events.push({
        date: d,
        type: a.type,
        color: TYPE_COLORS[a.type] || "bg-gray-500",
        title: a.title,
        detail: a.client ? `${a.client.firstName} ${a.client.lastName}` : "",
        time: a.time,
      });
    });

    payments.forEach((p) => {
      const d = new Date(p.dueDate).toISOString().split("T")[0];
      const isOverdue = p.status === "PENDIENTE" && new Date(p.dueDate) < new Date();
      if (p.status !== "PAGADO") {
        events.push({
          date: d,
          type: isOverdue ? "VENCIDO" : "PAGO",
          color: isOverdue ? TYPE_COLORS.VENCIDO : TYPE_COLORS.PAGO,
          title: `Cobro: ${p.contract.property.title}`,
          detail: `${p.contract.client.firstName} ${p.contract.client.lastName} - $${p.amount.toLocaleString("es-AR")}`,
        });
      }
    });

    return events;
  }, [appointments, payments]);

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
  const daysInMonth = lastDay.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const eventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.filter((e) => e.date === dateStr);
  };

  const selectedEvents = selectedDate ? allEvents.filter((e) => e.date === selectedDate) : [];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <Calendar size={24} /> Calendario
      </h1>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries({ ...TYPE_COLORS }).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {TYPE_LABELS[key] || key.charAt(0) + key.slice(1).toLowerCase()}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} className="min-h-[80px] bg-gray-900/30 rounded-lg" />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsForDate(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                    className={`min-h-[80px] p-1.5 rounded-lg text-left transition-colors border ${
                      isSelected ? "border-emerald-500 bg-emerald-600/10" :
                      isToday ? "border-emerald-600/40 bg-gray-800/50" :
                      "border-transparent bg-gray-900/50 hover:bg-gray-800/50"
                    }`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-emerald-400" : "text-gray-300"}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <div key={j} className={`${e.color} rounded px-1 py-0.5 text-[9px] font-medium text-white truncate`}>
                          {e.time ? `${e.time} ` : ""}{e.title.length > 15 ? e.title.slice(0, 15) + "…" : e.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-gray-500">+{dayEvents.length - 3} más</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar - selected day events */}
        <div>
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">
              {selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "Seleccioná un día"}
            </h3>
            {!selectedDate ? (
              <p className="text-xs text-gray-600">Hacé click en un día para ver sus eventos</p>
            ) : selectedEvents.length === 0 ? (
              <p className="text-xs text-gray-600">No hay eventos este día</p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((e, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-2 h-2 rounded-full ${e.color}`} />
                      <span className="text-[10px] text-gray-500 uppercase">{TYPE_LABELS[e.type] || e.type}</span>
                      {e.time && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={8} />{e.time}</span>}
                    </div>
                    <p className="text-sm text-white font-medium">{e.title}</p>
                    {e.detail && <p className="text-xs text-gray-400 mt-1">{e.detail}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
