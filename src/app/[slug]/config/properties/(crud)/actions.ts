"use server"

import { getCurrentUser } from "@/lib/auth"
import { getInmobiliariaDAO } from "@/services/inmobiliaria-services"
import { deleteAllPropertiesOfInmo, deleteProperty } from "@/services/property-services"
import { revalidatePath } from "next/cache"


export type DataProperty = {
    id: string
    idPropiedad: string
    tipo: string
    titulo: string
    descripcion: string
    zona: string
    ciudad: string
    departamento: string
    pais: string
    enVenta: string
    enAlquiler: string
    enAlquilerTemporal: string
    monedaVenta: string
    precioVenta: string
    monedaAlquiler: string
    precioAlquiler: string
    monedaAlquilerTemporal: string
    precioAlquilerTemporal: string
    alquilada: string
    dormitorios: string
    banios: string
    garages: string
    parrilleros: string
    piscinas: string
    calefaccion: string
    amueblada: string
    piso: string
    pisosEdificio: string
    seguridad: string
    asensor: string
    lavadero: string
    superficieTotal: string
    superficieConstruida: string
    monedaGastosComunes: string
    gastosComunes: string    
}

export async function deletePropertyAction(id: string): Promise<boolean> {    
    const currentUser= await getCurrentUser()
    if (!currentUser) return false
    const isAdmin= currentUser?.role === 'admin'
    if (!isAdmin) throw new Error('No tienes permisos para realizar esta acción')

    const deleted= await deleteProperty(id)
    if (!deleted) return false
  
    if (!deleted.inmobiliariaId) return false
  
    const inmo= await getInmobiliariaDAO(deleted.inmobiliariaId)
  
    revalidatePath(`/${inmo?.slug}/config/properties`)
  
    return true
  }
  
  export async function deleteAllPropertiesOfInmoAction(inmoId: string): Promise<boolean> {    
    const currentUser= await getCurrentUser()
    if (!currentUser) return false
    const isAdmin= currentUser?.role === 'admin'
    if (!isAdmin) throw new Error('No tienes permisos para realizar esta acción')

    const properties= await deleteAllPropertiesOfInmo(inmoId)
    if (!properties) return false

    const inmo= await getInmobiliariaDAO(inmoId)

    revalidatePath(`/${inmo?.slug}/config/properties`)

    return true
  }