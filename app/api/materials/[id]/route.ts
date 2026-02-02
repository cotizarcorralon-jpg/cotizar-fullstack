import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const membership = await prisma.companyMember.findFirst({
        where: { userId }
    });

    if (!membership) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { id } = params;
    const { name, unit, price, synonyms } = await req.json();

    // Verify material belongs to user's company
    const existingMaterial = await prisma.material.findFirst({
        where: {
            id,
            companyId: membership.companyId
        }
    });

    if (!existingMaterial) {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const material = await prisma.material.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(unit && { unit }),
            ...(price !== undefined && { price: parseFloat(price) }),
            ...(synonyms && { synonyms })
        }
    });

    return NextResponse.json({ material });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const membership = await prisma.companyMember.findFirst({
        where: { userId }
    });

    if (!membership) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { id } = params;

    // Verify material belongs to user's company
    const existingMaterial = await prisma.material.findFirst({
        where: {
            id,
            companyId: membership.companyId
        }
    });

    if (!existingMaterial) {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    await prisma.material.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
