
//export async function similaritySearchV3(tipo: string, operacion: string, caracteristicas: string, dormitorios: number) : Promise<SimilaritySearchResult[]> {

import { similaritySearchV3 } from "./pedido-services";

async function main() {
    const tipo = 'apartamento';
    const operacion= 'alquiler';
    const caracteristicas = 'piscina y parrilero';
    const dormitorios = 2;

    const result = await similaritySearchV3(tipo, operacion, caracteristicas, dormitorios);

    console.log(result);

    console.log('Fin');
    
}

//main();