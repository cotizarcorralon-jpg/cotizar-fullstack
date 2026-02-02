import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

    const quotes = await prisma.quote.findMany({
        where: { companyId: membership.companyId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });

    return NextResponse.json({ quotes });
}
