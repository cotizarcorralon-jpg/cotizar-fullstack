
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseMessage } from '@/lib/parsingLogic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, companyId } = body;

        console.log(`Generating quote for Company: ${companyId}`);

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // 1. Fetch Company Materials
        // We order by name length desc to prioritize "Ladrillo Hueco 12" over "Ladrillo"
        const materials = await prisma.material.findMany({
            where: { companyId },
            orderBy: {
                name: 'asc' // Parsing logic handles specificity, but sorting helps UX
            }
        });

        // 2. Parse Logic
        // parseMessage expects materials to have 'keywords' array.
        // Prisma returns keywords as String[], which matches.
        const items = parseMessage(text, materials);

        // 3. Calculate Total
        const total = items.reduce((acc: number, item: any) => acc + item.subtotal, 0);

        // 4. Check for pallet special flag (returned by parser attached to array or we check items)
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
