import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Validate basic fields exist if needed, or allow partial updates
        // Remove fields that shouldn't be updated directly or map correctly
        const { plan, materials, ...updateData } = body;

        console.log("Updating Company:", id, updateData);

        const updatedCompany = await prisma.company.update({
            where: { id: id },
            data: updateData
        });

        return NextResponse.json(updatedCompany);

    } catch (error) {
        console.error("Error updating company:", error);
        return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
    }
}
