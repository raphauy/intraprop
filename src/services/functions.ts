import { createOrUpdatePedidoAction } from "@/app/admin/pedidos/pedido-actions";
import { PedidoFormValues, getPedidoDAO, updatePedido } from "./pedido-services";

export const functions= [
  {
    name: "registrarPedido",
    description:
      "Registra un pedido de búsqueda de propiedades. Se debe invocar esta función para registrar un pedido.",
    parameters: {
      type: "object",
      properties: {
        pedidoId: {
          type: "string",
          description: "Identificador del pedido a analizar. Este identificador es proporcionado junto al texto del pedido.",
        },
        tipo: {
          type: "string",
          description: "casa, apartamento, terreno, local, etc. Si no se puede encontrar un tipo en el texto del pedido se debe llenar este campo con N/D",
        },
        operacion: {
          type: "string",
          description: "alquiler o venta. Si no se puede encontrar la operación en el texto del pedido se debe llenar este campo con N/D",
        },
        presupuestoMin: {
          type: "number",
          description: "valor de presupuesto mínimo. Valor de compra si quiere comprar o valor de alquiler si quiere alquilar. Si no se puede encontrar un valor para presupuesto en el texto del pedido se debe llenar este campo con N/D. No confundir ese valor con el valor de gastos comunes.",
        },
        presupuestoMax: {
          type: "number",
          description: "valor de presupuesto máximo. Valor de compra si quiere comprar o valor de alquiler si quiere alquilar. Si no se puede encontrar un valor para presupuesto en el texto del pedido se debe llenar este campo con N/D. No confundir ese valor con el valor de gastos comunes.",
        },
        presupuestoMoneda: {
          type: "string",
          description: "USD, UYU, N/D. Notar que los pedidos son en Uruguay, si se utiliza la palabra pesos se refiere a UYU, si se utiliza la palabra dólares se refiere a USD. Si utiliza el símbolo $ se refiere a UYU.",
        },
        gastosComunes: {
          type: "string",
          description: "Valor y moneda de los gastos comunes. Por ejemplo: 100 USD, 1000 UYU. Este dato generalmente no está y cuando está es para un alquiler. Si no está se debe llenar este campo con N/D",
        },
        zona: {
          type: "string",
          description: "barrio, departamento o ciudad",
        },
        dormitorios: {
          type: "string",
          description: "cantidad de dormitorios",
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


export async function registrarPedido(pedidoId: string, tipo: string, operacion: string, presupuestoMin: number, presupuestoMax: number, presupuestoMoneda: string, gastosComunes: string, zona: string, dormitorios: string, caracteristicas: string, contacto: string) {
  console.log("pedidoId: ", pedidoId)
  console.log("tipo: ", tipo)
  console.log("operacion: ", operacion)
  console.log("presupuestoMin: ", presupuestoMin)
  console.log("presupuestoMax: ", presupuestoMax)
  console.log("presupuestoMoneda: ", presupuestoMoneda)
  console.log("zona: ", zona)
  console.log("dormitorios: ", dormitorios)
  console.log("caracteristicas: ", caracteristicas)

  if (pedidoId) {
    const pedido= await getPedidoDAO(pedidoId)
    const formattedCaracteristicas= getCaracteristicas(tipo, operacion, presupuestoMin, presupuestoMax, presupuestoMoneda, gastosComunes, zona, dormitorios, caracteristicas)
    const pedidoForm: PedidoFormValues= {
      text: pedido.text,
      phone: pedido.phone as string,
      tipo: tipo,
      operacion: operacion,
      presupuesto: presupuestoMin === presupuestoMax ? presupuestoMin + "" : presupuestoMin + "-" + presupuestoMax,
      presupuestoMin: presupuestoMin,
      presupuestoMax: presupuestoMax,
      presupuestoMoneda: presupuestoMoneda,
      zona: zona,
      dormitorios: dormitorios,
      caracteristicas: formattedCaracteristicas,
      contacto: contacto,        
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
  if (tipo && tipo !== "N/D") {
    formattedCaracteristicas= tipo
  }
  if (operacion && operacion !== "N/D") {
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
  if (presupuestoMoneda && presupuestoMoneda !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + " " + presupuestoMoneda
  }
  if (dormitorios && dormitorios !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + " con " + dormitorios + " dormitorios"
  }
  if (zona && zona !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + ", en " + zona
  }
  if (gastosComunes && gastosComunes !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + ", con gastos comunes " + gastosComunes
  }
  if (caracteristicas && caracteristicas !== "N/D") {
    formattedCaracteristicas= formattedCaracteristicas + ". Extras: " + caracteristicas
  }
  return formattedCaracteristicas
}



export async function runFunction(name: string, args: any) {
  switch (name) {
    case "registrarPedido":
      return registrarPedido(args["pedidoId"], args["tipo"], args["operacion"], args["presupuestoMin"], args["presupuestoMax"], args["presupuestoMoneda"], args["gastosComunes"], args["zona"], args["dormitorios"], args["caracteristicas"], args["contacto"])

    default:
      return null;
  }
}
