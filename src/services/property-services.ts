import { prisma } from "@/lib/db";
import { Property } from "@prisma/client";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import pgvector from 'pgvector/utils';

export default async function getPropertys() {

  const found = await prisma.property.findMany({
    orderBy: {
      idPropiedad: 'asc',
    },
  })

  return found;
}

export async function getPropertiesOfInmobiliaria(inmobiliariaId: string) {

  const found = await prisma.property.findMany({
    where: {
      inmobiliariaId
    },
    orderBy: {
      idPropiedad: 'asc',
    },
  })

  return found;
}

export async function getSpecificPropertiesOfinmobiliaria(inmobiliariaId: string, specifics: string[]) {

  const found = await prisma.property.findMany({
    where: {
      inmobiliariaId,
      idPropiedad: {
        in: specifics
      }
    },
  })

  // ordenar los resultados en el mismo orden que los ids de entrada
  const sorted: Property[] = found.sort((a, b) => {
    const aIndex = specifics.indexOf(a.idPropiedad ?? '')
    const bIndex = specifics.indexOf(b.idPropiedad ?? '')
    return aIndex - bIndex
  })


  return sorted
}

export async function getPercentages(inmobiliariaId: string): Promise<Percentages> {
  
    const found = await prisma.property.findMany({
      where: {
        inmobiliariaId
      },
      select: {
        enVenta: true,
        enAlquiler: true,
      },
    })
  
    const sales = found.filter((property) => property.enVenta === 'si').length
    const rents = found.filter((property) => property.enAlquiler === 'si').length
  
    return {
      sales: `${sales}`,
      rents: `${rents}`,
    }
}


export async function getProperty(id: string) {

  const found = await prisma.property.findUnique({
    where: {
      id
    },
  })

  return found
}

export async function deleteProperty(id: string): Promise<Property> {
  const deleted= await prisma.property.delete({
    where: {
      id
    },
  })

  return deleted
}

export async function deletePropertyOfInmobiliariaByIdPropiedad(inmobiliariaId: string, idPropiedad: string): Promise<boolean> {
  const deleted= await prisma.property.deleteMany({
    where: {
      inmobiliariaId,
      idPropiedad
    },
  })

  if (!deleted) return false

  return true
}

export async function deleteAllPropertiesOfInmo(inmobiliariaId: string): Promise<boolean> {
  const deleted= await prisma.property.deleteMany({
    where: {
      inmobiliariaId
    },
  })

  if (!deleted) return false

  return true
}

export async function getPropertiesCount(inmobiliariaId: string) {

  const found = await prisma.property.count({
    where: {
      inmobiliariaId
    },
  })

  return found  
}

export type PropertyDataToEmbed = {
  id?: string;
  idPropiedad?: string
  tipo?: string
  enVenta?: string
  enAlquiler?: string
  alquilada?: string
  zona?: string
  ciudad?: string
  departamento?: string
  dormitorios?: string
  banios?: string
  garages?: string
  parrilleros?: string
  piscinas?: string
  calefaccion?: string
  monedaVenta?: string
  precioVenta?: string
  monedaAlquiler?: string
  precioAlquiler?: string
  monedaGastosComunes?: string
  gastosComunes?: string
  titulo?: string
  descripcion?: string
}


export async function updateEmbeddings() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  })

  // iterar sobre las primeras 5 propiedades
  const properties: PropertyDataToEmbed[] = await prisma.$queryRaw`SELECT 
  id,
  "idPropiedad",
  tipo, 
  "enVenta", 
  "enAlquiler", 
  alquilada, 
  zona, 
  ciudad,  
  departamento,
  dormitorios,
  banios,
  garages,
  parrilleros,
  piscinas,
  calefaccion,
  "monedaVenta",
  "precioVenta",
  "monedaAlquiler",
  "precioAlquiler",
  "monedaGastosComunes",
  "gastosComunes",
  titulo,
  descripcion
  FROM "Property"`;
  //FROM "Property" LIMIT 1`;

  for (const property of properties) {
    let textToEmbed= property.tipo
    if (property.enVenta === 'si' && property.enAlquiler === 'si')
      textToEmbed += ' en venta y alquiler'
    else if (property.enVenta === 'si')
      textToEmbed += ' en venta'
    else if (property.enAlquiler === 'si')
      textToEmbed += ' en alquiler'
    property.zona !== "" && (textToEmbed += ` en ${property.zona},`)
    property.ciudad !== "" && (textToEmbed += ` en ${property.ciudad},`)
    property.departamento !== "" && (textToEmbed += ` en ${property.departamento},`)    
    property.dormitorios !== "" && (textToEmbed += ` con ${property.dormitorios} dormitorios,`)
    property.banios !== "" && (textToEmbed += ` con ${property.banios} baños,`)
    property.garages !== "" && (textToEmbed += ` con ${property.garages} garages,`)
    property.parrilleros !== "" && (textToEmbed += ` con ${property.parrilleros} parrilleros,`)
    property.piscinas !== "" && (textToEmbed += ` con ${property.piscinas} piscinas,`)
    property.calefaccion !== "" && (textToEmbed += ` con calefacción,`)
    property.monedaVenta !== "" && property.precioVenta !== "" && (textToEmbed += ` con precio de venta ${property.precioVenta} ${property.monedaVenta},`)
    property.monedaAlquiler !== "" && property.precioAlquiler !== "" && (textToEmbed += ` con precio de alquiler ${property.precioAlquiler} ${property.monedaAlquiler},`)
    property.monedaGastosComunes !== "" && property.gastosComunes !== "" && (textToEmbed += ` con gastos comunes de ${property.gastosComunes} ${property.monedaGastosComunes}.`)
    property.titulo !== "" && (textToEmbed += `. ${property.titulo}.`)
    property.descripcion !== "" && (textToEmbed += `. ${property.descripcion}.`)

    if (!textToEmbed) {
      console.log(`No text to embed for property ${property.idPropiedad}`)
      continue
    }
    const id= property.id
    // remove field id from content object
    delete property.id
    // remove all fields that are empty strings
    const keys= Object.keys(property)
    for (const key of keys) {
      if (property[key as keyof PropertyDataToEmbed] === '') {
        delete property[key as keyof PropertyDataToEmbed]
      }
    }


    const vector= await embeddings.embedQuery(textToEmbed)
    const embedding = pgvector.toSql(vector)
    await prisma.$executeRaw`UPDATE "Property" SET embedding = ${embedding}::vector, content = ${textToEmbed} WHERE id = ${id}`
    console.log(`Text embeded: ${textToEmbed}`)    
  }  

}

export async function updateEmbedding(propertyId: string) {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  })

  // iterar sobre las primeras 5 propiedades
  const properties: PropertyDataToEmbed[] = await prisma.$queryRaw`SELECT 
  id,
  "idPropiedad",
  tipo, 
  "enVenta", 
  "enAlquiler", 
  alquilada, 
  zona, 
  ciudad,  
  departamento,
  dormitorios,
  banios,
  garages,
  parrilleros,
  piscinas,
  calefaccion,
  "monedaVenta",
  "precioVenta",
  "monedaAlquiler",
  "precioAlquiler",
  "monedaGastosComunes",
  "gastosComunes",
  titulo,
  descripcion
  FROM "Property"
  WHERE id=${propertyId}`;

  for (const property of properties) {
    let textToEmbed= property.tipo
    if (property.enVenta === 'si' && property.enAlquiler === 'si')
      textToEmbed += ' en venta y alquiler'
    else if (property.enVenta === 'si')
      textToEmbed += ' en venta'
    else if (property.enAlquiler === 'si')
      textToEmbed += ' en alquiler'
    property.zona !== null && property.zona !== "" && (textToEmbed += ` en ${property.zona},`)
    property.ciudad !== null && property.ciudad !== "" && (textToEmbed += ` en ${property.ciudad},`)
    property.departamento !== null && property.departamento !== "" && (textToEmbed += ` en ${property.departamento},`)    
    property.dormitorios !== null && property.dormitorios !== "" && (textToEmbed += ` con ${property.dormitorios} dormitorios,`)
    property.banios !== null && property.banios !== "" && (textToEmbed += ` con ${property.banios} baños,`)
    property.garages !== null && property.garages !== "" && (textToEmbed += ` con ${property.garages} garages,`)
    property.parrilleros !== null && property.parrilleros !== "" && (textToEmbed += ` con ${property.parrilleros} parrilleros,`)
    property.piscinas !== null && property.piscinas !== "" && (textToEmbed += ` con ${property.piscinas} piscinas,`)
    property.calefaccion !== null && property.calefaccion !== "" && (textToEmbed += ` con calefacción,`)
    property.monedaVenta !== null && property.monedaVenta !== "" && property.precioVenta !== "" && (textToEmbed += ` con precio de venta ${property.precioVenta} ${property.monedaVenta},`)
    property.monedaAlquiler !== null && property.monedaAlquiler !== "" && property.precioAlquiler !== "" && (textToEmbed += ` con precio de alquiler ${property.precioAlquiler} ${property.monedaAlquiler},`)
    property.monedaGastosComunes !== null && property.monedaGastosComunes !== "" && property.gastosComunes !== "" && (textToEmbed += ` con gastos comunes de ${property.gastosComunes} ${property.monedaGastosComunes}.`)
    property.titulo !== null && property.titulo !== "" && (textToEmbed += `. ${property.titulo}.`)
    property.descripcion !== null && property.descripcion !== "" && (textToEmbed += `. ${property.descripcion}.`)

    if (!textToEmbed) {
      console.log(`No text to embed for property ${property.idPropiedad}`)
      continue
    }
    const id= property.id
    // remove field id from content object
    delete property.id
    // remove all fields that are empty strings
    const keys= Object.keys(property)
    for (const key of keys) {
      if (property[key as keyof PropertyDataToEmbed] === '') {
        delete property[key as keyof PropertyDataToEmbed]
      }
    }


    const vector= await embeddings.embedQuery(textToEmbed)
    const embedding = pgvector.toSql(vector)
    await prisma.$executeRaw`UPDATE "Property" SET embedding = ${embedding}::vector, content = ${textToEmbed} WHERE id = ${id}`
    console.log(`Text embeded: ${textToEmbed}`)    
  }  

}

export type SimilaritySearchResult = {
  idPropiedad: string
  url: string
  titulo: string
  content: string
  distance: number
}
export async function similaritySearch(inmobiliariaId: string, tipo: string, operacion: string, searchInput: string, limit: number = 10) : Promise<SimilaritySearchResult[]> {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  })

  const tipoConMayuscula= tipo.charAt(0).toUpperCase() + tipo.slice(1)

  const vector= await embeddings.embedQuery(searchInput)
  const embedding = pgvector.toSql(vector)

  let result: SimilaritySearchResult[]= []
  if (operacion === "venta" || operacion === "vender" || operacion === "compra" || operacion === "comprar")
    result = await prisma.$queryRaw`SELECT "idPropiedad", "url", titulo, content, embedding <-> ${embedding}::vector as distance FROM "Property" WHERE "inmobiliariaId" = ${inmobiliariaId} AND "tipo" = ${tipoConMayuscula} AND "enVenta" = 'si' ORDER BY distance LIMIT ${limit}`
  else if (operacion === "alquiler" || operacion === "alquilar" || operacion === "renta" || operacion === "rentar")
    result = await prisma.$queryRaw`SELECT "idPropiedad", "url", titulo, content, embedding <-> ${embedding}::vector as distance FROM "Property" WHERE "inmobiliariaId" = ${inmobiliariaId} AND "tipo" = ${tipoConMayuscula} AND "enAlquiler" = 'si' ORDER BY distance LIMIT ${limit}`

  result.map((item) => {
    console.log(`${item.titulo}: ${item.distance}`)    
  })

  return result
}

type ContextItem = {
  idPropiedad: string
  infoPropiedad: string
}

export async function promptChatGPT(inmobiliariaId: string, tipo: string, operacion: string, llmModel: string, promptTemplate: string, userInput: string, limit: number) {
  const similarityArray= await similaritySearch(inmobiliariaId, tipo, operacion, userInput, limit)
  const context: ContextItem[]= similarityArray.map((item) => {
    return {
      idPropiedad: item.idPropiedad,
      infoPropiedad: item.content,
    }
  })

  const contextString= JSON.stringify(context)

  const prompt= PromptTemplate.fromTemplate(promptTemplate)

  const llm = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: llmModel,
  })
  console.log(`llmModel: ${llmModel}`)
  console.log("input: ", userInput)        

  const chain= new LLMChain( { llm, prompt } )

  const result= await chain.call({
    CONTEXTO: contextString,
    INPUT_inmobiliariaE: userInput,
  })
  console.log(`result: ${result.text}`)

  if (result.text.includes('SIN_RESULTADOS')) {
    const similarityZero= { idPropiedad: 'SIN_RESULTADOS', url: "", titulo: 'SIN_RESULTADOS', content: 'SIN_RESULTADOS', distance: 0 }

    // insert the similarityZero at the beginning of the array
    similarityArray.unshift(similarityZero)
    return similarityArray
  }

  // filtrar las propiedades que no se mostraron y mantener el orden
  const filteredSimilarityArray: SimilaritySearchResult[]= []
  for (const item of similarityArray) {
    if (result.text.includes(item.idPropiedad)) {
      filteredSimilarityArray.push(item)
    }
  }
  
  return filteredSimilarityArray  
}


export type Percentages = {
    sales: string
    rents: string
}
