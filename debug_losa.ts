import { parseMessage } from './lib/parsingLogic';

const materials: any[] = [
    { id: 1, name: 'Cemento (bolsa 25 kg)', unit: 'bolsa', price: 8500, keywords: ['cemento', 'bolsa de cemento', 'cemento 25'] },
    { id: 2, name: 'Cal (bolsa)', unit: 'bolsa', price: 4500, keywords: ['cal', 'cal comun', 'bolsa de cal'] },
    { id: 3, name: 'Arena', unit: 'm3', price: 15000, keywords: ['arena', 'arena fina', 'metros de arena', 'metro de arena', 'mts arena'] },
    { id: 4, name: 'Piedra partida', unit: 'm3', price: 28000, keywords: ['piedra', 'piedra partida', 'metros de piedra'] },
    { id: 7, name: 'Hierro / Acero (kg)', unit: 'kg', price: 1200, keywords: ['hierro', 'acero', 'barra del', 'hierro del'] }
];

const text = "hola necesito hacer una loza de 10x10 me decis cuantos materiales son";

try {
    console.log("Starting parse...");
    const results = parseMessage(text, materials);
    console.log("Parse success!");
    console.log(JSON.stringify(results, null, 2));
} catch (e: any) {
    console.error("Parse failed!");
    console.error(e);
}
