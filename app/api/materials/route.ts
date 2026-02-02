import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET all materials for user's company
export async function GET(req: NextRequest) {
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

    const materials = await prisma.material.findMany({
        where: { companyId: membership.companyId },
        orderBy: { name: 'asc' }
    });

    return NextResponse.json({ materials });
}

// POST - Add new material
export async function POST(req: NextRequest) {
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

    const { name, unit, price, synonyms } = await req.json();

    const material = await prisma.material.create({
        data: {
            companyId: membership.companyId,
            name,
            unit: unit || 'u',
            price: parseFloat(price) || 0,
            synonyms: synonyms || [name.toLowerCase()]
        }
    });

    return NextResponse.json({ material });
}
