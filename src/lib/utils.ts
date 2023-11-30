import { type ClassValue, clsx } from "clsx"
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumberWithDots(numberString: string): string {
  const number = parseInt(numberString);
  
  return number.toLocaleString('es-UY');
}

export function slugify(name: string): string {
  return name
    .toLowerCase() // Convertir a minúsculas
    .normalize('NFD') // Descomponer los acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar los acentos
    .replace(/[^a-z0-9 ]/g, '') // Eliminar caracteres que no sean letras, números o espacios
    .trim() // Eliminar espacios al inicio y al final
    .replace(/\s+/g, '-'); // Reemplazar espacios con guiones
}

// this function receives a distance which is a number between 0 and 0.8 (embedding factor)
// and returns a number between 0 and 100 as a percentage
// example 0.8 -> 100
// example 0.4 -> 50
// example 0.45 -> 65
// example 0.0 -> 0
// distance is between 0 and 0.8
export function distanceToPercentage(distance: number): number {
  if (distance < 0.1) return 100
  
  return Math.round((1.1 - distance) * 100);
}

export function formatPresupuesto(presupuestoMin: number | undefined, presupuestoMax: number | undefined, presupuestoMoneda: string | undefined) {
   
  if (presupuestoMin && presupuestoMax && presupuestoMin === presupuestoMax)
      return presupuestoMin.toLocaleString("es-UY") + " " + presupuestoMoneda

  if (presupuestoMin && presupuestoMax)
      return presupuestoMin.toLocaleString("es-UY") + " - " + presupuestoMax.toLocaleString("es-UY") + " " + presupuestoMoneda

  if (presupuestoMin)
      return presupuestoMin.toLocaleString("es-UY") + " " + presupuestoMoneda + " o más"

  if (presupuestoMax)
      return presupuestoMax.toLocaleString("es-UY") + " " + presupuestoMoneda + " o menos"

  return "N/D"
}

export function mapNotificationStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "sent":
      return "Enviada"
    case "error":
      return "Error"
    default:
      return "N/D"
  }
}

export function formatPedidoNumber(pedidoNumber: number) {
  return "#" + pedidoNumber.toString().padStart(5, "0")
}

export function formatDateTime(date: Date) {
  const isToday= format(date, "dd/MM/yyyy", { locale: es }) === format(new Date(), "dd/MM/yyyy", { locale: es })
  return isToday ? format(date, "'hoy' HH:mm", { locale: es }) : format(date, "dd/MM/yyyy HH:mm", { locale: es })
}

export function formatDateTimeWithSeconds(date: Date) {
  const isToday= format(date, "dd/MM/yyyy", { locale: es }) === format(new Date(), "dd/MM/yyyy", { locale: es })
  return isToday ? format(date, "'hoy' HH:mm:ss", { locale: es }) : format(date, "dd/MM/yyyy HH:mm:ss", { locale: es })
}