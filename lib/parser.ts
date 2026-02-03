export interface Material {
    id: string;
    name: string;
    unit: string;
    price: number;
    synonyms: string[];
}

export interface ParsedItem {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
    materialId?: string;
    isRecognized: boolean;
}

export interface ParseResult {
    items: ParsedItem[];
    notes: string[];
    hasPallets: boolean;
}

/**
 * ✅ Función principal (para que puedas importar parseMessage sin cambiar nada)
 */
export function parseMessage(text: string, materials: Material[]): ParseResult {
    return parseWhatsAppMessage(text, materials);
}

/**
 * ✅ Alias (por si ya la tenías con este nombre)
 */
export function parseWhatsAppMessage(text: string, materials: Material[]): ParseResult {
    if (!text) return { items: [], notes: [], hasPallets: false };

    const chunks = text.split(/\n|,| y | e | con |\+/i);

    const items: ParsedItem[] = [];
    const notes: string[] = [];
    let hasPallets = false;

    chunks.forEach((chunk) => {
        const cleanChunk = chunk.trim();
        if (!cleanChunk) return;

        const chunkLower = cleanChunk.toLowerCase();

        // 1) Detectar cantidad
        const quantityMatch = cleanChunk.match(/(?:x\s*)?(\d+[.,]?\d*)/i);
        let quantity = 1;

        if (quantityMatch) {
            const qStr = (quantityMatch[1] || quantityMatch[0]).replace(',', '.');
            const parsed = parseFloat(qStr);
            quantity = Number.isFinite(parsed) ? parsed : 1;
        }

        // 2) Matchear material por synonyms (keyword más largo gana)
        let bestMatch: Material | null = null;
        let maxScore = 0;

        for (const mat of materials) {
            for (const keyword of mat.synonyms) {
                const k = keyword.toLowerCase();
                if (k && chunkLower.includes(k)) {
                    if (k.length > maxScore) {
                        maxScore = k.length;
                        bestMatch = mat;
                    }
                }
            }
        }

        // 2.5) Regla especial: pallets de ladrillos
        const isPallet = /palet|pallet/i.test(chunkLower);
        const isBrick = /ladrillo/i.test(chunkLower);

        if (isPallet && isBrick && bestMatch) {
            hasPallets = true;

            let unitsPerPallet = 144; // default ladrillo 12
            let sizeLabel: '8' | '12' | '18' = '12';

            // Primero: inferir desde el texto
            if (/ladrillo.*8|hueco.*8|del.*8/i.test(chunkLower)) {
                unitsPerPallet = 216;
                sizeLabel = '8';
            } else if (/ladrillo.*18|hueco.*18|del.*18/i.test(chunkLower)) {
                unitsPerPallet = 90;
                sizeLabel = '18';
            } else {
                // Si el texto no aclara, inferimos desde el nombre del material matcheado
                const nm = bestMatch.name;
                if (nm.includes('8') && !nm.includes('18')) {
                    unitsPerPallet = 216;
                    sizeLabel = '8';
                } else if (nm.includes('18')) {
                    unitsPerPallet = 90;
                    sizeLabel = '18';
                }
            }

            const palletsCount = quantity;
            const totalUnits = palletsCount * unitsPerPallet;

            items.push({
                name: `${bestMatch.name} — ${palletsCount} ${palletsCount > 1 ? 'pallets' : 'pallet'} (${totalUnits} unidades)`,
                quantity: totalUnits,
                unit: bestMatch.unit,
                unitPrice: bestMatch.price,
                subtotal: totalUnits * bestMatch.price,
                materialId: bestMatch.id,
                isRecognized: true
            });

            notes.push(`Se detectó ${palletsCount} pallet(s) de ladrillo del ${sizeLabel} = ${totalUnits} unidades`);
            return;
        }

        // 3) Resultado normal
        if (bestMatch) {
            items.push({
                name: bestMatch.name,
                quantity,
                unit: bestMatch.unit,
                unitPrice: bestMatch.price,
                subtotal: quantity * bestMatch.price,
                materialId: bestMatch.id,
                isRecognized: true
            });
            return;
        }

        // 4) No reconocido pero con cantidad: lo agregamos para edición manual
        if (quantityMatch) {
            let nameClean = cleanChunk;

            if (quantityMatch[0]) {
                nameClean = nameClean.replace(quantityMatch[0], '');
            }

            nameClean = nameClean
                .replace(/^(necesito|quiero|busco|traeme|dame|de|del|el|la|los|las)\s+/i, '')
                .replace(/\s+(de|del|el|la|los|las)$/i, '')
                .trim();

            nameClean = nameClean
                .replace(/^(necesito|quiero|busco|precio|cotizar|hola)\s+/ig, '')
                .replace(/^(de|del)\s+/i, '')
                .trim();

            if (nameClean.length > 2) {
                items.push({
                    name: nameClean,
                    quantity,
                    unit: 'u',
                    unitPrice: 0,
                    subtotal: 0,
                    isRecognized: false
                });
                notes.push(`Material "${nameClean}" no reconocido - asignar precio manualmente`);
            }
        }
    });

    return { items, notes, hasPallets };
}
