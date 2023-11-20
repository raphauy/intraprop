import { type ClassValue, clsx } from "clsx"
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
// example 0.0 -> 0
// distance is between 0 and 0.8
export function distanceToPercentage(distance: number): number {
  if (distance < 0.1) return 100
  
  return Math.round((1.1 - distance) * 100);
}