import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Validate basic fields exist if needed, or allow partial updates
        // Remove fields that shouldn't be updated directly or map correctly
        const { plan, materials, id: _id, userId, createdAt, updatedAt, ...rest } = body;

        // Map frontend keys to DB keys if necessary
        const updateData: any = { ...rest };

        if (body.web !== undefined) updateData.website = body.web;
        if (body.logo !== undefined) updateData.logoUrl = body.logo;
        if (body.terms !== undefined) updateData.pdfTerms = body.terms;

        // Remove legacy frontend keys so Prisma doesn't complain
        delete updateData.web;
        delete updateData.logo;
        delete updateData.terms;

        console.log("Updating Company:", id, "Data keys:", Object.keys(updateData));

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
