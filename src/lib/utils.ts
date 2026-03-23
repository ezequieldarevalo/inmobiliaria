import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PROVINCES = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

export function formatCurrency(amount: number, currency: string = "ARS") {
  if (currency === "USD") {
    return `US$ ${amount.toLocaleString("es-AR")}`;
  }
  return `$ ${amount.toLocaleString("es-AR")}`;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("es-AR");
}
