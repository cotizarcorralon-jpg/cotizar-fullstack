interface Material {
    id: string;
    name: string;
    unit: string;
    price: number;
    synonyms: string[];
}

interface ParsedItem {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
    materialId?: string;
    isRecognized: boolean;
}

interface ParseResult {
    items: ParsedItem[];
    notes: string[];
    hasPallets: boolean;
}

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

        // 1. Detect Quantity
        const quantityMatch = cleanChunk.match(/(?:x\s*)?(\d+[.,]?\d*)/i);
        let quantity = 1;

        if (quantityMatch) {
            const qStr = (quantityMatch[1] || quantityMatch[0]).replace(',', '.');
            quantity = parseFloat(qStr);
        }

        // 2. Match Material
        let bestMatch: Material | null = null;
        let maxScore = 0;

        materials.forEach((mat) => {
            mat.synonyms.forEach((keyword) => {
                if (chunkLower.includes(keyword.toLowerCase())) {
                    if (keyword.length > maxScore) {
                        maxScore = keyword.length;
                        bestMatch = mat;
                    }
                }
            });
        });

        // 2.5 SPECIAL RULE: PALLETS OF BRICKS
        const isPallet = /palet|pallet/i.test(chunkLower);
        const isBrick = /ladrillo/i.test(chunkLower);

        if (isPallet && isBrick && bestMatch) {
            hasPallets = true;
            let unitsPerPallet = 144; // Default to 12
            let sizeLabel = '12';

            if (/ladrillo.*8|hueco.*8|del.*8/i.test(chunkLower)) {
                unitsPerPallet = 216;
                sizeLabel = '8';
            } else if (/ladrillo.*18|hueco.*18|del.*18/i.test(chunkLower)) {
                unitsPerPallet = 90;
                sizeLabel = '18';
            } else {
                if (bestMatch.name.includes('8') && !bestMatch.name.includes('18')) {
                    unitsPerPallet = 216;
                    sizeLabel = '8';
                } else if (bestMatch.name.includes('18')) {
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

        // 3. Construct Result
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
        } else if (quantityMatch) {
            // Unrecognized material
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
