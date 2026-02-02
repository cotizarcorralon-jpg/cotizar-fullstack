import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { parseWhatsAppMessage } from '@/lib/parser';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { text } = await req.json();

    if (!text || !text.trim()) {
        return NextResponse.json({ error: 'Texto requerido' }, { status: 400 });
    }

    // Get user's company
    const membership = await prisma.companyMember.findFirst({
        where: { userId },
        include: {
            company: {
                include: {
                    subscription: true,
                    materials: true
                }
            }
        }
    });

    if (!membership) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { company } = membership;
    const plan = company.subscription?.plan || 'FREE';

    // Check usage limit for FREE plan
    if (plan === 'FREE') {
        const monthKey = new Date().toISOString().slice(0, 7);
        let usage = await prisma.usage.findUnique({
            where: {
                companyId_monthKey: {
                    companyId: company.id,
                    monthKey
                }
            }
        });

        if (!usage) {
            usage = await prisma.usage.create({
                data: {
                    companyId: company.id,
                    monthKey,
                    quoteCount: 0
                }
            });
        }

        if (usage.quoteCount >= 3) {
            return NextResponse.json(
                {
                    error: 'LIMIT_REACHED',
                    message: 'Alcanzaste el límite de 3 presupuestos por mes. Actualizá a PRO para ilimitados.'
                },
                { status: 403 }
            );
        }
    }

    // Parse the message
    const parseResult = parseWhatsAppMessage(text, company.materials);
    const total = parseResult.items.reduce((acc, item) => acc + item.subtotal, 0);

    // Save quote to DB
    const quote = await prisma.quote.create({
        data: {
            companyId: company.id,
            userId,
            rawText: text,
            parsedItems: parseResult.items as any,
            notes: parseResult.notes as any,
            total
        }
    });

    // Increment usage
    const monthKey = new Date().toISOString().slice(0, 7);
    await prisma.usage.upsert({
        where: {
            companyId_monthKey: {
                companyId: company.id,
                monthKey
            }
        },
        create: {
            companyId: company.id,
            monthKey,
            quoteCount: 1
        },
        update: {
            quoteCount: {
                increment: 1
            }
        }
    });

    return NextResponse.json({
        quoteId: quote.id,
        items: parseResult.items,
        total,
        notes: parseResult.notes,
        hasPallets: parseResult.hasPallets
    });
}
