import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Here 'id' is treated as CompanyId because lib/api.js calls getMaterials(companyId)
        const { id: companyId } = await params;

        const materials = await prisma.material.findMany({
            where: { companyId },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(materials);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching materials' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Here 'id' is treated as MaterialId because lib/api.js calls updateMaterial(id, data)
        const { id: materialId } = await params;
        const body = await req.json();

        const updated = await prisma.material.update({
            where: { id: materialId },
            data: {
                name: body.name,
                unit: body.unit,
                price: parseFloat(body.price),
                // We don't update keywords from the simple UI yet usually, but if passed:
                ...(body.keywords && { keywords: body.keywords })
            }
        });

        return NextResponse.json(updated);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating material' }, { status: 500 });
    }
}
