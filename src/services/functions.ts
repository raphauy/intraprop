import { getValue } from "./config-services";
import { sendWapMessage } from "./osomService";
import { PedidoFormValues, getPedidoDAO, updatePedido } from "./pedido-services";

export const functions= [
  {
    name: "registrarPedido",
    description:
      "Registra un pedido de búsqueda de propiedades. Se debe invocar esta función para registrar un pedido. Importante: No debes inferir ni inventar información, si ésta no se encuentra en el texto debes llenar el campo correspondiente con N/D.",
    parameters: {
      type: "object",
      properties: {
        pedidoId: {
          type: "string",
          description: "Identificador del pedido a analizar. Este identificador es proporcionado junto al texto del pedido.",
        },
        intencion: {
          type: "string",
          description: "Este campo tiene tres valores posibles PEDIDO, OFERTA y NINGUNO. Se debe identificar la intención del texto que puede ser un pedido de propiedad o una oferta de propiedad. Generalmente las ofertas dicen cosas como 'comparto', 'compartimos' o ponen links. Generalmente los pedidos dicen cosas como 'busco', 'necesito', 'estoy buscando', etc. Si no se puede identificar la intención se debe llenar este campo con NINGUNO.",
        },
        tipo: {
          type: "string",
          description: "ejemplos de los valores de este campo: casa, apartamento, casa/apartamento, terreno, local, oficina, etc. Cuando dicen PH se refieren a un apartamento. Si no se puede encontrar un tipo en el texto del pedido se debe llenar este campo con N/D",
        },
        operacion: {
          type: "string",
          enum: ["N/D, ALQUILER", "VENTA", "ALQUILER/VENTA"],
          description: "alquiler o venta. Importante: no inferir este valor, solo poner alquiler o venta si el pedido trae expresamente esta información. Si no se puede encontrar palabras como alquiler o venta en el texto del pedido se debe llenar este campo con N/D",
        },
        presupuestoMin: {
          type: "number",
          description: "valor de presupuesto mínimo. Valor de compra si quiere comprar o valor de alquiler si quiere alquilar. No confundir ese valor con el valor de gastos comunes. Si dicen '...hasta cierto valor' se debe llenar este campo con 0. Si el presupuesto no es un rango, es un valor solo, este campo se debe llegar con ese valor al igual que el campo presupuestoMax.",
        },
        presupuestoMax: {
          type: "number",
          description: "valor de presupuesto máximo. Valor de compra si quiere comprar o valor de alquiler si quiere alquilar. No confundir ese valor con el valor de gastos comunes.",
        },
        presupuestoMoneda: {
          type: "string",
          enum: ["USD", "UYU", ""],
          description: "Genaralmente los alquileres son en UYU y las VENTAS son en USD. Importante: Si no se puede encontrar la moneda en el texto del pedido se debe dejar este campo vacío. Si pone solo un valor como 700 no se debe asumir que es 700 UYU ni 700 USD, se debe dejar este campo vacío. Si es una operación de VENTA puedes asumir que son USD",
        },
        gastosComunes: {
          type: "string",
          description: "Valor y moneda de los gastos comunes. Por ejemplo: 100 USD, 1000 UYU. Este dato generalmente no está y cuando está es para un alquiler. Si no está se debe llenar este campo con N/D",
        },
        zona: {
          type: "string",
          description: "barrio, departamento o ciudad, puede ser un barrio o varios barrios, este campo se debe llenar con los barrios que aparezcan en el texto del pedido. Si ponen abstracciones como 'zonas varias' por ejemplo se debe llenar con n/d",
        },
        dormitorios: {
          type: "string",
          description: "cantidad de dormitorios, este valor debe ser un número, si piden 3 o 4 se debe cargar 3, si piden 2/3 se debe cargar 2, siempre el mínimo, si piden 4+ se debe cargar 4. Si no se puede encontrar la cantidad de dormitorios en el texto del pedido se debe llenar este campo con 0",
        },
        caracteristicas: {
          type: "string",
          description: "Este campo contiene las características de la propiedad como cantidad de dormitorios, si tiene piscina, si tiene garage, si tiene parrillero, etc.",
        },
        contacto: {
          type: "string",
          description: "Algún dato del que escribe el pedido que pueda aparecer en el texto del pedido. Por ejemplo, un nombre, un teléfono, un email, un nombre de Inmobiliaria, etc.",
        },
      },
      required: ["pedidoId"],
    },    
  },
];


export async function registrarPedido(pedidoId: string, intencion: string, tipo: string, operacion: string, presupuestoMinOrig: number, presupuestoMaxOrig: number, presupuestoMoneda: string, gastosComunes: string, zona: string, dormitorios: string, caracteristicas: string, contacto: string) {
  console.log("pedidoId: ", pedidoId)
  console.log("intencion: ", intencion)
  console.log("tipo: ", tipo)
  console.log("operacion: ", operacion)
  console.log("presupuestoMin: ", presupuestoMinOrig)
  console.log("presupuestoMax: ", presupuestoMaxOrig)
  console.log("presupuestoMoneda: ", presupuestoMoneda)
  console.log("zona: ", zona)
  console.log("dormitorios: ", dormitorios)
  console.log("caracteristicas: ", caracteristicas)

  if (operacion.toUpperCase().includes("ALQUILER")) operacion= "ALQUILER"

  if (operacion.toUpperCase().includes("COMPRA")) operacion= "VENTA"

  presupuestoMinOrig= corregirPresupuesto(presupuestoMinOrig, operacion, presupuestoMoneda)
  presupuestoMaxOrig= corregirPresupuesto(presupuestoMaxOrig, operacion, presupuestoMoneda)  

  if (pedidoId) {
    const BUDGET_PERC_MIN= await getValue("BUDGET_PERC_MIN")
    let budgetPercMin= 0.85
    if(BUDGET_PERC_MIN) budgetPercMin= parseFloat(BUDGET_PERC_MIN) / 100
    else console.log("BUDGET_PERC_MIN not found")

    const BUDGET_PERC_MAX= await getValue("BUDGET_PERC_MAX")
    let budgetPercMax= 1.1
    if(BUDGET_PERC_MAX) budgetPercMax= parseFloat(BUDGET_PERC_MAX) / 100
    else console.log("BUDGET_PERC_MAX not found")

    const COTIZACION= await getValue("COTIZACION")
    let cotizacion= 40
    if(COTIZACION) cotizacion= parseFloat(COTIZACION)
    else console.log("COTIZACION not found")

    const isAlquiler= operacion && (operacion.toUpperCase() === "ALQUILER" || operacion.toUpperCase() === "ALQUILAR")
    // cambiar presupuestoMoneda cuando sea alquiler y la moneda sea USD
    if (isAlquiler && presupuestoMoneda && presupuestoMoneda.toUpperCase() === "USD") {
      presupuestoMoneda= "UYU"
      presupuestoMinOrig= Math.round(presupuestoMinOrig * cotizacion)
      presupuestoMaxOrig= Math.round(presupuestoMaxOrig * cotizacion)
    }

    const isVenta= operacion && operacion.toUpperCase() === "VENTA"
    // cambiar presupuestoMoneda cuando sea venta y la moneda sea UYU
    if (isVenta && presupuestoMoneda && presupuestoMoneda.toUpperCase() === "UYU") {
      presupuestoMoneda= "USD"
      presupuestoMinOrig= Math.round(presupuestoMinOrig / cotizacion)
      presupuestoMaxOrig= Math.round(presupuestoMaxOrig / cotizacion)
    }


    let presupuestoMin= undefined
    if (presupuestoMinOrig) presupuestoMin= Math.round((presupuestoMinOrig * (1-budgetPercMin)) * 100) / 100
    let presupuestoMax= undefined
    if (presupuestoMaxOrig) presupuestoMax= Math.round((presupuestoMaxOrig * (1+budgetPercMax)) * 100) / 100

    const presupuestoLog= `Rango buscado: (${presupuestoMin ? presupuestoMin.toLocaleString('es-UY') : "0"}, ${presupuestoMax ? presupuestoMax.toLocaleString('es-UY') : "inf"}) ${presupuestoMoneda}, (-${budgetPercMin*100}%, +${budgetPercMax*100}%)`
    const presupuesto= (presupuestoMinOrig === presupuestoMaxOrig ? (presupuestoMinOrig ? presupuestoMinOrig.toLocaleString('es-UY') : "-") + "" : 
        (presupuestoMinOrig ? presupuestoMinOrig.toLocaleString('es-UY')+"-" : "") + (presupuestoMaxOrig ? presupuestoMaxOrig.toLocaleString('es-UY') : "inf")) + " " + (presupuestoMoneda ? presupuestoMoneda : "")

    const isPedido= intencion.toUpperCase() === "PEDIDO"
    const pedido= await getPedidoDAO(pedidoId)

    if (!pedido) {
      console.log("Pedido not found")
      return
    } 

    let pedidoForm: PedidoFormValues= {
      text: pedido.text,
      phone: pedido.phone as string,
      contacto: "status: discarded, intención: " + intencion, 
      status: "discarded",
    }

    if (isPedido) {
      const formattedCaracteristicas= getCaracteristicas(tipo, operacion, presupuestoMinOrig, presupuestoMaxOrig, presupuestoMoneda, gastosComunes, zona, dormitorios, caracteristicas)
      const name= pedido.name ? "Hola " + pedido.name + "! " : ""
      const pauseCheck= checkPause(name, pedido.group || "-", tipo, operacion, zona, presupuestoMinOrig, presupuestoMaxOrig, presupuestoMoneda)
      pedidoForm= {
        text: pedido.text,
        phone: pedido.phone as string,
        tipo: tipo && tipo.toLowerCase(),
        operacion: operacion && operacion.toUpperCase(),
        presupuesto,
        presupuestoMin,
        presupuestoMax,
        presupuestoLog: presupuestoLog,
        presupuestoMoneda: presupuestoMoneda,
        zona: zona,
        dormitorios: dormitorios,
        caracteristicas: formattedCaracteristicas,
        contacto: pauseCheck.msgToUser,
        status: pauseCheck.status,
      }
      console.log("Pedido is " + intencion + ", processing.")
      if (pauseCheck.status === "paused") {
        console.log("Pausing pedido #" + pedido.number + " from " + pedido.phone + ", name: " + pedido.name);
        
        console.log(pauseCheck.msgToUser)        
        sendWapMessage(pedido.phone as string, pauseCheck.msgToUser)
      } else {
        const previousStatus= pedido.status
        if (previousStatus === "paused") {
          console.log("Pedido #" + pedido.number + " was paused, resuming. (send final message)")
        }
      }
    } else {
      console.log("Pedido #" + pedido.number + " is" + intencion + ", discarding.")
    }



    const updated= await updatePedido(pedidoId, pedidoForm)
    if (!updated) {
      console.log("No se pudo actualizar el pedido.")
    } else {
      console.log("Pedido actualizado.")
    }

  }

  const responseData = {
    status: "success",
    message: "Este es el final, no hace falta una respuesta.",
  }
  return responseData
}

function getCaracteristicas(tipo: string, operacion: string, presupuestoMin: number, presupuestoMax: number, presupuestoMoneda: string, gastosComunes: string, zona: string, dormitorios: string, caracteristicas: string) {
  let formattedCaracteristicas= ""
  if (tipo && tipo.toUpperCase() !== "N/D") {
    formattedCaracteristicas= tipo
  }
  if (operacion && operacion.toUpperCase() !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + " para " + operacion
  }
  if (presupuestoMin === presupuestoMax && presupuestoMin && presupuestoMax) {
    formattedCaracteristicas= formattedCaracteristicas + " con valor " + presupuestoMax
  } else if (presupuestoMin && presupuestoMax) {
    formattedCaracteristicas= formattedCaracteristicas + " con valor entre " + presupuestoMin + " y " + presupuestoMax
  } else if (presupuestoMin) {
    formattedCaracteristicas= formattedCaracteristicas + " con valor mayor a " + presupuestoMin
  } else if (presupuestoMax) {
    formattedCaracteristicas= formattedCaracteristicas + " con valor menor a " + presupuestoMax
  }
  if (presupuestoMoneda && presupuestoMoneda.toUpperCase() !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + " " + presupuestoMoneda
  }
  if (dormitorios && dormitorios.toUpperCase() !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + " con " + dormitorios + " dormitorios"
  }
  if (zona && zona.toUpperCase() !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + ", en " + zona
  }
  if (gastosComunes && gastosComunes.toUpperCase() !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + ", con gastos comunes " + gastosComunes
  }
  if (caracteristicas && caracteristicas.toUpperCase() !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + ". Extras: " + caracteristicas
  }
  return formattedCaracteristicas
}

type PauseData= {
  status: "paused" | "pending"
  msgToUser: string
}
// check if we have all required fields
// required fields: tipo, operacion, zona
// if we have all required fields, return "pending"
// if we don't have all required fields, return "paused"
// if the status is paused, return the message to the user with the fields that are missing
function checkPause(nombre: string, grupo: string, tipo: string, operacion: string, zona: string, presupuestoMin: number, presupuestoMax: number, presupuestoMoneda: string): PauseData {
  console.log("checkPause: ")
  console.log("\tgrupo: ", grupo)
  console.log("\ttipo: ", tipo)
  console.log("\toperacion: ", operacion)
  console.log("\tzona: ", zona)
  console.log("\tpresupuestoMin: ", presupuestoMin)
  console.log("\tpresupuestoMax: ", presupuestoMax)
  console.log("\tpresupuestoMoneda: ", presupuestoMoneda)
  
  let partial= ""
  if (!tipo || tipo.toUpperCase() === "N/D") {
    partial+= "tipo: (casa, apartamento, local, etc.)\n"
  }
  if (!operacion || operacion.toUpperCase() === "N/D") {
    partial+= "operación: (ALQUILER o VENTA)\n"
  }
  if (!zona || zona.toUpperCase() === "N/D") {
    partial+= "zona: (Pocitos, La Tahona, etc)\n"
  }
  if (!presupuestoMin && !presupuestoMax) {
    partial+= "presupuesto: (valor o rango, UYU o USD)\n"
  } else if (!presupuestoMoneda || presupuestoMoneda.toUpperCase() === "N/D") {
    partial+= "moneda: (UYU o USD)\n"
  }
  if (partial) {
    const msgToUser= `${nombre}Te escribimos desde Intraprop porque acabas de hacer un pedido en el grupo ${grupo}, para poder procesarlo y buscar coincidencias en las propiedades de los colegas, por favor respondé este mensaje con el siguiente texto completando la información: \n\n${partial}`
    return {
      status: "paused",
      msgToUser,
    }
  } else {
    return {
      status: "pending",
      msgToUser: "",
    }
  }
}


function corregirPresupuesto(presupuesto: number, operacion: string, presupuestoMoneda: string) {
  if (presupuesto === 0)
    return presupuesto

  let res= presupuesto

  if (operacion.toUpperCase() === "ALQUILER" && presupuestoMoneda.toUpperCase() === "UYU") {
      if (presupuesto < 1000) res= presupuesto * 1000
  }
  
  if (operacion.toUpperCase() === "VENTA" && presupuestoMoneda.toUpperCase() === "USD") {
    if (presupuesto < 1000) res= presupuesto * 1000
  }

  return res  
}


export async function runFunction(name: string, args: any) {
  switch (name) {
    case "registrarPedido":
      return registrarPedido(args["pedidoId"], args["intencion"], args["tipo"], args["operacion"], args["presupuestoMin"], args["presupuestoMax"], args["presupuestoMoneda"], args["gastosComunes"], args["zona"], args["dormitorios"], args["caracteristicas"], args["contacto"])

    default:
      return null;
  }
}
