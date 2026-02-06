const findBestMatch = (text, materials) => {
    if (!materials || !Array.isArray(materials)) return null;

    let bestMatch = null;
    let maxScore = 0;
    const textLower = text.toLowerCase();

    materials.forEach(mat => {
        if (!mat.keywords || !Array.isArray(mat.keywords)) return;

        mat.keywords.forEach(keyword => {
            if (textLower.includes(keyword)) {
                // Conflict resolution: Hueco vs Comun
                if (textLower.includes('comun') && mat.name.toLowerCase().includes('hueco')) return;
                if (textLower.includes('hueco') && mat.name.toLowerCase().includes('comun')) return;

                if (keyword.length > maxScore) {
                    maxScore = keyword.length;
                    bestMatch = mat;
                }
            }
        });
    });
    return bestMatch;
};

export const parseMessage = (text, materials) => {
    if (!text) return [];

    const chunks = text.split(/\n|,| y | e | con |\+| y /i);
    const results = [];

    // Helper to add calculated item
    const addCalculatedItem = (queryName, qty, unit, description) => {
        const match = findBestMatch(queryName, materials);
        if (match) {
            results.push({
                ...match,
                quantity: qty,
                subtotal: qty * match.price,
                originalLine: description,
                isCustom: false
            });
        } else {
            results.push({
                id: `calc-${Date.now()}-${Math.random()}`,
                name: queryName.charAt(0).toUpperCase() + queryName.slice(1) + (description ? ` (${description})` : ''),
                unit: unit,
                price: 0,
                subtotal: 0,
                quantity: qty,
                originalLine: description || "Calculado automáticamente",
                isCustom: true
            });
        }
    };

    chunks.forEach(chunk => {
        const cleanChunk = chunk.trim();
        if (!cleanChunk) return;

        const chunkLower = cleanChunk.toLowerCase();

        // --- 0. SPECIAL LOGIC: LOSA / SLAB CALCULATION ---
        // Regex to detect "losa/loza 10x10" or "losa de 10 x 10"
        // Also supports "10m x 10m"
        const slabMatch = chunkLower.match(/lo[sz]a.*?(?:de\s+)?(\d+(?:[.,]\d+)?)\s*(?:m|mts|metros)?\s*[xX*]\s*(\d+(?:[.,]\d+)?)/i);

        if (slabMatch) {
            const width = parseFloat(slabMatch[1].replace(',', '.'));
            const length = parseFloat(slabMatch[2].replace(',', '.'));
            const area = width * length;
            const perimeter = (width + length) * 2;
            const thickness = 0.10; // 10 cm standard
            const volume = area * thickness;

            // Formulas from prompt
            // Cemento: 350 kg/m3. 350 kg * 10 m3 = 3500 kg. / 25 = 140 bolsas.
            // Bags = Ceil(Volume * 350 / 25)
            const cementBags = Math.ceil((volume * 350) / 25);

            // Arena: 0.5 m3 per m3 concrete
            const arenaVol = parseFloat((volume * 0.5).toFixed(2));

            // Piedra: 0.8 m3 per m3 concrete
            const piedraVol = parseFloat((volume * 0.8).toFixed(2));

            // Hierro: 100m2 -> 100-120kg. Let's avg 1.1 kg/m2 using area? 
            // The prompt says "Hierro suelto: 100 a 120 kg aprox (DLosa 100m2)"
            // So approx 1 - 1.2 kg per m2. Let's use 1.0 kg/m2 for simplicity or 100kg for 100m2.
            // Actually prompt says "100 a 120 kg". I will uses 100kg for 100m2 -> 1 kg/m2.
            const hierroKg = Math.ceil(area * 1.0);

            // Nylon: Area
            const nylonM2 = area;

            // Alambre: 2-3kg per 100m2 -> 0.03 kg/m2.
            const alambreKg = Math.ceil(area * 0.03);

            // Encofrado: Permiter (linear meters) * 1? 
            // Prompt says "Madera: ~40 m lineales" for 10x10 (Perimeter=40). So it matches perimeter.
            const woodM = Math.ceil(perimeter);

            // Add Items
            addCalculatedItem("cemento", cementBags, "bols", `Cálculo Losa ${width}x${length}m`);
            addCalculatedItem("arena", arenaVol, "m3", `Cálculo Losa`);
            addCalculatedItem("piedra", piedraVol, "m3", `Cálculo Losa`);

            // Try matching Malla first, else Hierro
            const mallaMatch = findBestMatch("malla", materials);
            if (mallaMatch) {
                // If mesh found, 1 unit per m2? or 1 mesh per X m2?
                // Prompt: "Malla electrosoldada para 100 m2".
                // Usually sold by unit (panel) e.g. 2x5m (10m2).
                // Logic: If unit is 'u' or 'panel', divide area / 10?
                // If unit is 'm2', use area.
                // Safest: Add as area and let user fix, or add generic "Malla" item.
                if (mallaMatch.unit === 'm2') {
                    addCalculatedItem("malla", area, "m2", "Malla Electrosoldada");
                } else {
                    // Assume panel 2.4x6 or similar?
                    // Let's just add the item with Area quantity and let user figure out if it's units.
                    // Or add description "Cubrir X m2"
                    addCalculatedItem("malla", area, mallaMatch.unit, `Malla (Cubrir ${area} m2)`);
                }
            } else {
                addCalculatedItem("hierro", hierroKg, "kg", "Hierro / Estructura");
            }

            addCalculatedItem("nylon", nylonM2, "m2", "Nylon / Film");
            addCalculatedItem("alambre", alambreKg, "kg", "Alambre Recocido");
            addCalculatedItem("tablas", woodM, "mL", "Madera Encofrado");
            // addCalculatedItem("separadores", ...); // Not specified qty, just listed.

            return; // Skip standard parsing for this chunk
        }

        // 1. Detect Quantity
        const quantityMatch = cleanChunk.match(/(?:x\s*)?(\d+[.,]?\d*)|\d+/i);
        let quantity = 1;
        let hasQuantity = false;

        if (quantityMatch) {
            const qStr = (quantityMatch[1] || quantityMatch[0]).replace(',', '.');
            quantity = parseFloat(qStr);
            hasQuantity = true;
        }

        // 2. Match Material
        let finalMatch = findBestMatch(cleanChunk, materials);

        // --- 2.5 SPECIAL RULE: PALLETS OF BRICKS ---
        const isPallet = /palet|pallet/i.test(chunkLower);
        const isBrick = /ladrillo/i.test(chunkLower);

        if (isPallet && isBrick && finalMatch) {
            let unitsPerPallet = 144; // Default

            const isComun = /comun|común/i.test(chunkLower) || /ladrillo comun/i.test(finalMatch.name);

            if (!isComun) {
                if (/ladrillo.*8|hueco.*8|del.*8/i.test(chunkLower)) {
                    unitsPerPallet = 216;
                } else if (/ladrillo.*18|hueco.*18|del.*18/i.test(chunkLower)) {
                    unitsPerPallet = 90;
                } else {
                    if (finalMatch.name.includes("18")) {
                        unitsPerPallet = 90;
                    }
                }

                const palletsCount = quantity;
                const totalUnits = palletsCount * unitsPerPallet;

                quantity = totalUnits;
                finalMatch = {
                    ...finalMatch,
                    name: `${finalMatch.name} — ${palletsCount} ${palletsCount > 1 ? 'pallets' : 'pallet'} (${totalUnits} unidades)`
                };
                results.hasPallets = true;
            }
        }

        // 3. Construct Result
        if (finalMatch) {
            results.push({
                ...finalMatch,
                quantity: quantity,
                subtotal: quantity * finalMatch.price,
                originalLine: cleanChunk,
                isCustom: false
            });
        } else if (hasQuantity) {
            let nameClean = cleanChunk;
            if (quantityMatch && quantityMatch[0]) {
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

            const potentialName = nameClean;
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
