import { prisma } from '@/lib/db';

export async function createOrUpdatePropertyWithPrisma(data: Propiedad, inmobiliariaId: string) {

  const found = await prisma.property.findFirst({
    where: {
      idPropiedad: data.idPropiedad,
      inmobiliariaId
    },
  })

  if (found) {
    const updated= await prisma.property.update({
      where: {
        id: found.id
      },
      data
    })
    return updated
  } else {
    const created= await prisma.property.create({
      data: {
        ...data,
        inmobiliaria: {
          connect: {
            id: inmobiliariaId
          }
        }
      }      
    })
    return created
  }  
}


type Propiedad = {
  idPropiedad: string,
  tipo: "Casa" | "Apartamento" | "Local" | "Terreno" | "Campo" | "Oficina" | "Galpón" | "Edificio" | "Chacra" | "Cochera" | "Otro",
  titulo: string,
  descripcion: string,
  zona: string,
  ciudad: string,
  departamento: string,
  pais: string,
  enVenta: "si" | "no",
  enAlquiler: "si" | "no",
  monedaVenta: string,
  precioVenta: string,
  monedaAlquiler: string,
  precioAlquiler: string,
  monedaAlquilerTemporal: string,
  precioAlquilerTemporal: string,
  alquilada: "si" | "no",
  dormitorios: string,
  banios: string,
  garages: string,
  parrilleros: string,
  piscinas: string,
  calefaccion: "si" | "no",
  amueblada: "si" | "no",
  piso: string,
  pisosEdificio: string,
  seguridad: "si" | "no",
  asensor: "si" | "no",
  lavadero: "si" | "no",
  superficieTotal: string,
  superficieConstruida: string,
  monedaGastosComunes: string,
  gastosComunes: string,
  url: string,
}


// test function
async function test() {
  const json= `{
    "idPropiedad": "4",
    "tipo": "Apto",
    "titulo": "Casa en Pocitos",
    "descripcion": "Casa en Pocitos",
    "zona": "Pocitos",
    "ciudad": "Montevideo",
    "departamento": "Montevideo",
    "pais": "Uruguay",
    "enVenta": "si",
    "enAlquiler": "no",
    "monedaVenta": "USD",
    "precioVenta": "100000",
    "monedaAlquiler": "USD",
    "precioAlquiler": "1000"
  }`
  const clientId= "clmcas57v0007je9ujfru35dx"
  const created= await createOrUpdatePropertyWithPrisma(JSON.parse(json), clientId)
  console.log('created: ', created)
}
