import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, unit, price, keywords, companyId } = body;

        if (!companyId || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newMaterial = await prisma.material.create({
            data: {
                name,
                unit,
                price: parseFloat(price),
                keywords: keywords || [name.toLowerCase()],
                companyId
            }
        });

        return NextResponse.json(newMaterial);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error adding material' }, { status: 500 });
    }
}
