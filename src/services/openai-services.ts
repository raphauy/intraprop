import { prisma } from "@/lib/db";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { functions, runFunction } from "./functions";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  

export async function createPedidoWithFunctions(text: string, phone: string, name: string | undefined, group: string | undefined) {
  const created = await prisma.pedido.create({
    data: {
      text,
      phone,
      name,
      group,
    },
  })

  if (!created) return null

  const textToPenAI= {
    pedidoId: created.id,
    text,
  }
  await runFunctions(JSON.stringify(textToPenAI))

  return created
}

export async function updatePedidoWithFunctions(pedidoId: string) {
  const pedido= await prisma.pedido.findUnique({
    where: {
      id: pedidoId,
    },
  })

  if (!pedido) return null

  const textToPenAI= {
    pedidoId: pedido.id,
    text: pedido.text,
  }
  await runFunctions(JSON.stringify(textToPenAI))

  return pedido
}

export async function runFunctions(text: string) {


    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: getSystemMessage(),
        },
        {
            role: "user",
            content: text,
        },
    ]

    // check if the conversation requires a function call to be made
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages,
        temperature: 0,
        stream: false,
        functions,
        function_call: "auto",
    })

    // log the response
    response.choices.forEach((choice) => {
        const response: ResponseType = choice.message as ResponseType
        if (response.function_call) {
            console.log("function_call: ", response.function_call)
            const functionCall= response.function_call
            const functionCallName= functionCall.name
            const functionCallArguments= functionCall.arguments
            const functionCallArgumentsObject= JSON.parse(functionCallArguments)
            runFunction(functionCallName, functionCallArgumentsObject)
        } else {
          console.log("Response is not a function call.")          
          console.log("Content: ", response.content)
        }
    })
    
    
}

type ResponseType = {
  role: 'assistant' | 'user' | 'system'; // Asumiendo que puede haber otros roles
  content: null | string;
  function_call: FunctionCallType | null;
}

type FunctionCallType = {
  name: string;
  arguments: string; // JSON string que representa los argumentos
}


function getSystemMessage() {
  return `
Tu función es extraer del texto toda la información que puedas y utilizar la función 'registrarPedido' con esa información.
Si en lo que refiere a presupuesto hay un rango, se debe utilizar el valor más alto.
Es importante no confundir el valor del inmueble (en el caso de venta) o el valor del alquiler (en el caso de alquiler) con el valor de gastos comunes (que se pide a veces para apartamentos en alquiler).
`
}