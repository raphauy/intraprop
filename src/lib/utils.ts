import { getValue } from "@/services/config-services"
import { type ClassValue, clsx } from "clsx"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { twMerge } from "tailwind-merge"
import he from 'he'

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

export async function detectarMoneda(texto: string): Promise<"USD" | "UYU" | "N/D"> {

  const PATRON_USD= await getValue("PATRON_USD")
  let patronUSD= "USD,DÓLARES,DOLARES,DOL,DOLRES,U$S"
  if(PATRON_USD) patronUSD= PATRON_USD
  else console.log("PATRON_USD not found")

  const PATRON_UYU= await getValue("PATRON_UYU")
  let patronUYU= "UYU,PESOS,$"
  if(PATRON_UYU) patronUYU= PATRON_UYU
  else console.log("PATRON_UYU not found")

  // Función para escapar caracteres especiales en los patrones
  const escaparCaracteres = (texto: string) => texto.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  // Convertimos las listas de opciones en expresiones regulares, escapando caracteres especiales
  const regexUSD = new RegExp(patronUSD.split(',').map(escaparCaracteres).join('|'), 'i');
  const regexUYU = new RegExp(patronUYU.split(',').map(escaparCaracteres).join('|'), 'i');

  // Normalizamos el texto
  const textoNormalizado = texto.toUpperCase();

  // Buscamos los patrones en el texto
  if (regexUSD.test(textoNormalizado)) {
      return "USD";
  }

  if (regexUYU.test(textoNormalizado)) {
      return "UYU";
  }

  // Si no se encuentra ningún patrón, devolvemos "N/D"
  return "N/D";
}

export function decodeAndCorrectText(str: string): string {
  // Verifica si el input es undefined o null y devuelve una cadena vacía
if (str === undefined || str === null) {
  return ''
}

// Primero, decodifica las entidades HTML
let decodedStr: string = he.decode(str)

// Corrige la codificación incorrecta de tildes y eñes
const replacements: { [key: string]: string } = {
  'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
  'Ã±': 'ñ', 'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã“': 'Ó',
  'Ãš': 'Ú', 'Ã‘': 'Ñ',
  // los correctos
  'á': 'á', 'é': 'é', 'í': 'í', 'ó': 'ó', 'ú': 'ú', // Asegurar corrección si ya están correctos
  'Á': 'Á', 'É': 'É', 'Í': 'Í', 'Ó': 'Ó', 'Ú': 'Ú',
  'ñ': 'ñ', 'Ñ': 'Ñ'
}

Object.keys(replacements).forEach((key) => {
  const value: string = replacements[key];
  decodedStr = decodedStr.replace(new RegExp(key, 'g'), value);
})

// Manejar casos especiales como "cumplea{ tilde}os", "{ 'ia}"
const specialReplacements: { [pattern: string]: string } = {
  '\\{ tilde\\}': 'ñ',
  '\\{ \'a\\}': 'á',
  '\\{ \'e\\}': 'é',
  '\\{ \'i\\}': 'í',
  '\\{ \'o\\}': 'ó',
  '\\{ \'u\\}': 'ú',
  '\\{ \'n\\}': 'ñ',
  // Versiones mayúsculas por si acaso también son necesarias
  '\\{ \'A\\}': 'Á',
  '\\{ \'E\\}': 'É',
  '\\{ \'I\\}': 'Í',
  '\\{ \'O\\}': 'Ó',
  '\\{ \'U\\}': 'Ú',
  '\\{ \'N\\}': 'Ñ',
}

Object.keys(specialReplacements).forEach((pattern) => {
  const replacement: string = specialReplacements[pattern];
  decodedStr = decodedStr.replace(new RegExp(pattern, 'g'), replacement);
})

const additionalReplacements: { [key: string]: string } = {
  'est�': 'está',
  'ma�ana': 'mañana',
  'a�o': 'año',
  'a�os': 'años',
  'cumplea�os': 'cumpleaños',    
  'Mart�n': 'Martín',
  'Malv�n': 'Malvín',
  'Juli�n': 'Julián',
  'Ger�nimo': 'Gerónimo',
  'Germ�n': 'Germán',
  'Gast�n': 'Gastón',
  'Est�vez': 'Estévez',
  'M�nimo': 'Mínimo',
  'm�nimo': 'mínimo',
  'M�ximo': 'Máximo',
  'm�ximo': 'máximo',
  'M�nica': 'Mónica',
  'M�dico': 'Médico',
  'm�dico': 'médico',
  'pr�stamo': 'préstamo',
}

Object.keys(additionalReplacements).forEach((key) => {
  const value: string = additionalReplacements[key];
  decodedStr = decodedStr.replace(new RegExp(key, 'g'), value);
})

// Luego, decodifica las secuencias de escape Unicode
decodedStr = decodedStr.replace(/\\u([\dA-F]{4})/gi, (match, numStr) => {
  return String.fromCharCode(parseInt(numStr, 16));
});

return decodedStr;
}

export function getStatusLabel(option: string) {

  let res= ""

  switch (option) {
    case "notifications_created":
      res= "exitoso"
      break;
    case "no_coincidences":
      res= "sin coincidencias"
      break;
      case "pending":
      res= "pendiente"
      break;
    case "paused":
      res= "pausado"
      break;
    default:
      res= option
      break;
  }
  
  return res
}