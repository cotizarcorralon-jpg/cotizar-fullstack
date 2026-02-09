const findAllMatches = (text, materials) => {
    if (!text) return [];
    const textLower = text.toLowerCase();
    let allMatches = [];

    materials.forEach(mat => {
        if (!mat.keywords || !Array.isArray(mat.keywords)) return;

        mat.keywords.forEach(keyword => {
            let pos = textLower.indexOf(keyword);
            while (pos !== -1) {
                // Conflict resolution: Hueco vs Comun (strict check)
                // If the keyword is "comun" but the text has "hueco" and the material is "Hueco", skip?
                // Original logic: if (textLower.includes('comun') && mat.name.toLowerCase().includes('hueco')) return;
                // We apply this invalidation logic per match context if possible, or global.
                // The global check is safer for now.
                let valid = true;
                if (keyword === 'comun' && textLower.includes('hueco') && mat.name.toLowerCase().includes('hueco')) valid = false;
                if (keyword.includes('hueco') && textLower.includes('comun') && mat.name.toLowerCase().includes('comun')) valid = false;

                if (valid) {
                    allMatches.push({
                        material: mat,
                        keyword: keyword,
                        index: pos,
                        length: keyword.length
                    });
                }
                pos = textLower.indexOf(keyword, pos + 1);
            }
        });
    });

    // Sort: Earliest index first. If tie, longest keyword first (Greedy match).
    allMatches.sort((a, b) => a.index - b.index || b.length - a.length);

    // Filter overlaps
    const uniqueMatches = [];
    let lastEnd = -1;

    for (const m of allMatches) {
        if (m.index >= lastEnd) {
            uniqueMatches.push(m);
            lastEnd = m.index + m.length;
        }
    }

    return uniqueMatches;
};


const findBestMatch = (text, materials) => {
    const matches = findAllMatches(text, materials);
    if (matches.length > 0) return matches[0].material;
    return null;
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

        // 1. Tokenize Chunk: Find all numbers and materials
        const numberRegex = /(?:x\s*)?(\d+(?:[.,]\d+)?)/gi;
        const numberMatches = [];
        let numMatch;
        while ((numMatch = numberRegex.exec(cleanChunk)) !== null) {
            // Check if this number is part of a dimension (e.g. 10x10) to avoid double counting? 
            // The split logic already splits by 'x' mostly? No, split is split(/\n|,| y | e | con |\+| y /i)
            // 'x' is not a split delimiter.
            // But typical quantity is "50 bolsas". "10x10" is handled by slab logic.
            // If slab logic returns, we don't reach here.

            // We store the number
            numberMatches.push({
                value: parseFloat(numMatch[1].replace(',', '.')),
                index: numMatch.index,
                length: numMatch[0].length,
                raw: numMatch[0]
            });
        }

        const materialMatches = findAllMatches(cleanChunk, materials);

        // If no materials found but we have quantities, maybe it's a "Custom Item"?
        // Or if we have material matches, we try to pair them.

        if (materialMatches.length === 0) {
            // --- Legacy single-item fallback (Logic 3) ---
            // 1. Detect Quantity (First number)
            const quantityMatch = cleanChunk.match(/(?:x\s*)?(\d+[.,]?\d*)|\d+/i);
            let quantity = 1;
            let hasQuantity = false;

            if (quantityMatch) {
                const qStr = (quantityMatch[1] || quantityMatch[0]).replace(',', '.');
                quantity = parseFloat(qStr);
                hasQuantity = true;
            }

            // Custom Item Logic
            if (hasQuantity) {
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
            return;
        }

        // --- Multi-item Parsing Strategy ---
        // Merge tokens: { type: 'NUM', val: ..., idx: ... } and { type: 'MAT', val: ..., idx: ... }
        const tokens = [];
        numberMatches.forEach(n => tokens.push({ type: 'NUM', ...n }));
        materialMatches.forEach(m => tokens.push({ type: 'MAT', ...m }));

        // Sort by index
        tokens.sort((a, b) => a.index - b.index);

        let currentQty = 1;
        let qtyUsed = false;

        tokens.forEach((token, i) => {
            if (token.type === 'NUM') {
                // Update current quantity state
                currentQty = token.value;
                qtyUsed = false;
            } else if (token.type === 'MAT') {
                // Found a material
                // Use currentQty.
                // However, check if currentQty was ALREADY used by a previous material?
                // Example: "50 arena y cal" -> Arena uses 50. Cal uses ?
                // If strict: Cal uses 1 (since 50 was associated with Arena).
                // My logic: `qtyUsed` flag.

                let quantityToUse = 1;

                // Heuristic: If we have a pending quantity that wasn't "consumed" immediately?
                // Actually, "50 arena" -> Num, Mat.
                // "Cal" -> Mat (no Num before it since Arena).

                if (!qtyUsed && currentQty !== 1) {
                    quantityToUse = currentQty;
                    qtyUsed = true; // Mark as used
                    // Reset currentQty for next items? 
                    // Usually yes. "50 arena 45 cemento".
                    // After Arena, we shouldn't use 50 again.
                    currentQty = 1;
                } else {
                    // If qty was used, or defaults to 1
                    quantityToUse = 1;
                }

                // CHECK PALLET LOGIC (Legacy ported to per-item)
                // We check if "palet" is near? Or just strictly check global 'chunkLower' as before?
                // The requirement is to be robust. 
                // Let's use the global chunk check for simplicity, as it rarely conflicts.
                let finalMatch = token.material;
                let quantity = quantityToUse;

                const isPallet = /palet|pallet/i.test(chunkLower);
                const isBrick = /ladrillo/i.test(finalMatch.name.toLowerCase()) || /ladrillo/i.test(token.keyword);

                if (isPallet && isBrick) {
                    let unitsPerPallet = 144; // Default
                    const isComun = /comun|común/i.test(token.keyword) || /ladrillo comun/i.test(finalMatch.name);

                    if (!isComun) {
                        if (/ladrillo.*8|hueco.*8|del.*8/i.test(chunkLower)) {
                            unitsPerPallet = 216;
                        } else if (/ladrillo.*18|hueco.*18|del.*18/i.test(chunkLower)) {
                            unitsPerPallet = 90;
                        } else {
                            if (finalMatch.name.includes("18")) unitsPerPallet = 90;
                        }

                        // If quantity is small (e.g. 1, 2), assume regex caught pallets count
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

                results.push({
                    ...finalMatch,
                    quantity: quantity,
                    subtotal: quantity * finalMatch.price,
                    originalLine: cleanChunk, // We can't really isolate the sub-string easily without more logic
                    isCustom: false
                });
            }
        });
    });

    return results;
};
