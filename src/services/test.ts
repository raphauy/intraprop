import { detectarMoneda } from "@/lib/utils";


async function main() {

    console.log(await detectarMoneda("Buenas tardes Estoy buscando 🏠*Alquiler apartamento* 🛌*3 dormitorios y servicio completo, con portería presencial, baños sin bañera* 🚘*Garaje* 📍*Zona Rambla Punta Carretas, Golf ,Buceo,Centro* 💲*Vamos hasta Usd 2.800 con gc* Victoria Shaw Vonhaus 094 326 848"))
    console.log(await detectarMoneda("busco apto para venta en Canelones, tengo 100 mil dólares"))
    console.log(await detectarMoneda("busco apto para alquilar de 2 dorm, miran hasta 30.000 pesos"))
    console.log(await detectarMoneda("busco apto para alquilar de 2 dorm, miran hasta $30.000"))
    console.log(await detectarMoneda("busco apto para alquilar, puede ser monoambiente, tengo 35 mil UYU"))
    console.log(await detectarMoneda("busco apto para venta en Canelones, tengo 100 mil dolares"))
    console.log(await detectarMoneda("Buenas tardes colegas, estoy buscando: Compra, casa, PU, de 2 o 3 dormitorios, 2 baños, con patio o fondo y garaje. Zonas: Barra de Carrasco, Jardines de Carrasco o Solymar de la Interbalnearia al sur.    Para reciclar mejor.  En el entorno de $ 200/300.     Desde ya, muchas gracias. Saludos. Raúl 098330033.-"))

    
}

main();