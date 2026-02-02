import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user's company membership
    const membership = await prisma.companyMember.findFirst({
        where: { userId },
        include: {
            company: {
                include: {
                    subscription: true
                }
            }
        }
    });

    if (!membership) {
        return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    // Get current month usage
    const monthKey = new Date().toISOString().slice(0, 7);
    let usage = await prisma.usage.findUnique({
        where: {
            companyId_monthKey: {
                companyId: membership.companyId,
                monthKey
            }
        }
    });

    if (!usage) {
        usage = await prisma.usage.create({
            data: {
                companyId: membership.companyId,
                monthKey,
                quoteCount: 0
            }
        });
    }

    return NextResponse.json({
        user: session.user,
        company: membership.company,
        role: membership.role,
        plan: membership.company.subscription?.plan || 'FREE',
        status: membership.company.subscription?.status || 'active',
        usage: {
            monthKey,
            quoteCount: usage.quoteCount,
            limit: membership.company.subscription?.plan === 'PRO' ? null : 3
        }
    });
}
