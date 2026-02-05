
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseMessage } from '@/lib/parsingLogic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, companyId } = body;

        // 1. IP Rate Limiting
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

        // Check if user is PRO to bypass limits
        let isPro = false;
        let dbCompany = null;

        if (companyId && companyId !== 'local') {
            dbCompany = await prisma.company.findUnique({
                where: { id: companyId },
                select: { id: true, plan: true }
            });
            if (dbCompany && dbCompany.plan === 'Profesional') {
                isPro = true;
            }
        }

        // Enforce limit for Non-Pro users
        if (!isPro) {
            const CACHE_LIMIT = 5; // IP Limit per 24h
            const startOfDay = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

            const usageCount = await (prisma as any).usageLog.count({
                where: {
                    ip: ip,
                    createdAt: { gte: startOfDay },
                    action: 'GENERATE_QUOTE'
                }
            });

            if (usageCount >= CACHE_LIMIT) {
                return NextResponse.json({
                    error: 'Límite diario alcanzado. Por favor, adquiere el plan PRO para continuar sin límites.'
                }, { status: 429 });
            }

            // Log usage
            await (prisma as any).usageLog.create({
                data: {
                    ip: ip,
                    action: 'GENERATE_QUOTE'
                }
            });
        }

        // 2. Fetch Materials (DB or Default)
        let materials = [];
        if (companyId && companyId !== 'local') {
            materials = await prisma.material.findMany({
                where: { companyId },
                orderBy: { name: 'asc' }
            });
        } else {
            // Default materials for Demo/Local
            materials = [
                { name: 'Cemento (bolsa 25 kg)', unit: 'bolsa', price: 8500, keywords: ['cemento', 'bolsa de cemento', 'cemento 25'] },
                { name: 'Cal (bolsa)', unit: 'bolsa', price: 4500, keywords: ['cal', 'cal comun', 'bolsa de cal'] },
                { name: 'Arena', unit: 'm3', price: 15000, keywords: ['arena', 'arena fina', 'metros de arena', 'metro de arena', 'mts arena'] },
                { name: 'Piedra partida', unit: 'm3', price: 28000, keywords: ['piedra', 'piedra partida', 'metros de piedra'] },
                { name: 'Ladrillo Común', unit: 'u', price: 100, keywords: ['ladrillo comun', 'ladrillo común', 'ladrillos comunes'] },
                { name: 'Ladrillo Hueco 8x18x33', unit: 'u', price: 300, keywords: ['ladrillo 8', 'hueco 8', 'ladrillo del 8', 'ladrillo hueco 8', 'ladrillos 8'] },
                { name: 'Ladrillo Hueco 12x18x33', unit: 'u', price: 350, keywords: ['ladrillo 12', 'hueco 12', 'ladrillo del 12', 'ladrillos', 'huecos', 'ladrillo hueco', 'ladrillos huecos'] },
                { name: 'Hierro / Acero (kg)', unit: 'kg', price: 1200, keywords: ['hierro', 'acero', 'barra del', 'hierro del'] }
            ] as any;
        }

        // 3. Parse Logic
        const items = parseMessage(text, materials);

        // 4. Calculate Total
        const total = items.reduce((acc: number, item: any) => acc + item.subtotal, 0);

        // 5. Check for pallet
        const hasPallets = (items as any).hasPallets || items.some((i: any) => i.name.includes('pallet'));

        return NextResponse.json({
            items,
            total,
            hasPallets
        });

    } catch (error) {
        console.error("Error generating quote:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
