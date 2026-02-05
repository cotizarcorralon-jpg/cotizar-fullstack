export const parseMessage = (text, materials) => {
    if (!text) return [];

    // Split by newlines, commas, " y ", " e ", " con ", " mas ", " + "
    // We use a regex that handles these separators case-insensitively
    const chunks = text.split(/\n|,| y | e | con |\+| y /i);
    const results = [];

    chunks.forEach(chunk => {
        const cleanChunk = chunk.trim();
        if (!cleanChunk) return;

        const chunkLower = cleanChunk.toLowerCase();

        // 1. Detect Quantity
        // Look for numbers. 
        // Support: "10", "10.5", "x10", "x 10"
        const quantityMatch = cleanChunk.match(/(?:x\s*)?(\d+[.,]?\d*)|\d+/i);
        let quantity = 1;
        let hasQuantity = false;

        if (quantityMatch) {
            // If we matched group 1 (the number part inside optional x), use it, else match[0]
            const qStr = (quantityMatch[1] || quantityMatch[0]).replace(',', '.');
            quantity = parseFloat(qStr);
            hasQuantity = true;
        }

        // 2. Match Material
        let bestMatch = null;
        let maxScore = 0;

        materials.forEach(mat => {
            mat.keywords.forEach(keyword => {
                // We match if the chunk includes the keyword
                if (chunkLower.includes(keyword)) {
                    // FIX: If chunk says "comun" but we matched "hueco", ignore it or penalize it
                    if (chunkLower.includes('comun') && mat.name.toLowerCase().includes('hueco')) {
                        return; // Skip this hollow match if user wanted common
                    }
                    if (chunkLower.includes('hueco') && mat.name.toLowerCase().includes('comun')) {
                        return;
                    }

                    // Score based on keyword length to prefer specific matches
                    // e.g. "pallet de ladrillo" (18) vs "ladrillo" (8) -> Prefer pallet
                    if (keyword.length > maxScore) {
                        maxScore = keyword.length;
                        bestMatch = mat;
                    }
                }
            });
        });

        // ... (inside loop)

        // --- 2.5 SPECIAL RULE: PALLETS OF BRICKS ---
        const isPallet = /palet|pallet/i.test(chunkLower);
        const isBrick = /ladrillo/i.test(chunkLower);

        if (isPallet && isBrick && bestMatch) {
            let unitsPerPallet = 144; // Default
            let sizeLabel = "12";

            // If we found a match for "Ladrillo Común", we shouldn't apply pallet logic normally used for Hueco
            // unless we know standard brick pallet size. Let's assume standard bricks don't use this logic 
            // OR use a specific logic. For now, if "comun" is detected, we might want to skip this or use different units.
            const isComun = /comun|común/i.test(chunkLower) || /ladrillo comun/i.test(bestMatch.name);

            if (isComun) {
                // Example logic for common brick pallet? Or just keep units.
                // If common brick, maybe 1000 units?
                // For now, let's just NOT treat it as the complex Hueco logic if it's explicitly comun
                // But wait, user wants differentiation. 
                // If "Ladrillo Coin" matched "Ladrillo Hueco" because of keyword "Ladrillo", that's the error.
                // We need to fix the priority in step 2 (below) but here we handle pallet sizing.
            }

            if (/ladrillo.*8|hueco.*8|del.*8/i.test(chunkLower)) {
                unitsPerPallet = 216;
                sizeLabel = "8";
            } else if (/ladrillo.*18|hueco.*18|del.*18/i.test(chunkLower)) {
                unitsPerPallet = 90;
                sizeLabel = "18";
            } else {
                // If the name says 18, use 90 (e.g. "Ladrillo Hueco 18")
                if (bestMatch.name.includes("18")) {
                    unitsPerPallet = 90;
                    sizeLabel = "18";
                }
            }

            const palletsCount = quantity;
            const totalUnits = palletsCount * unitsPerPallet;

            // Update Result Data
            quantity = totalUnits;

            // We want to persist the original pallet count in the display name
            // Clone the material to avoid mutating the global reference
            bestMatch = {
                ...bestMatch,
                name: `${bestMatch.name} — ${palletsCount} ${palletsCount > 1 ? 'pallets' : 'pallet'} (${totalUnits} unidades)`
            };

            // Flag to show info message later
            results.hasPallets = true;
        }

        // 3. Construct Result
        if (bestMatch) {
            results.push({
                ...bestMatch,
                quantity: quantity,
                subtotal: quantity * bestMatch.price,
                originalLine: cleanChunk,
                isCustom: false
            });
        } else if (hasQuantity) {
            // If we found a quantity but no material match, it's likely a custom item (or we missed it)
            // e.g. "40 metros de arena" if "arena" wasn't in keywords (it should be though)
            // We try to extract the text part as the name
            // Remove the quantity part (we might need to run the regex again to get full match including 'x')
            let nameClean = cleanChunk;
            if (quantityMatch && quantityMatch[0]) {
                nameClean = nameClean.replace(quantityMatch[0], '');
            }

            // Clean up common noise words from start/end
            // "de", "necesito", "quiero", "x"
            nameClean = nameClean
                .replace(/^(necesito|quiero|busco|traeme|dame|de|del|el|la|los|las)\s+/i, '')
                .replace(/\s+(de|del|el|la|los|las)$/i, '')
                .trim(); // Do it once

            // Loop cleanup in case multiple prefixes "necesito el precio de..."
            nameClean = nameClean
                .replace(/^(necesito|quiero|busco|precio|cotizar|hola)\s+/ig, '')
                .replace(/^(de|del)\s+/i, '')
                .trim();

            const potentialName = nameClean;
            // Ignore very short noise
            if (potentialName.length > 2) {
                results.push({
                    id: `custom-${Date.now()}-${Math.random()}`,
                    name: potentialName,
                    unit: 'u',
                    price: 0,
                    subtotal: 0,
                    quantity: quantity,
                    originalLine: cleanChunk,
                    isCustom: true
                });
            }
        }
    });

    return results;
};
