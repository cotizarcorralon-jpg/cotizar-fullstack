import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import MercadoPagoConfig, { PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const membership = await prisma.companyMember.findFirst({
        where: { userId },
        include: { company: true }
    });

    if (!membership) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { company } = membership;

    try {
        const preApproval = new PreApproval(client);

        const response = await preApproval.create({
            body: {
                preapproval_plan_id: process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID!,
                reason: `Suscripción PRO - ${company.name}`,
                external_reference: company.id,
                payer_email: session.user.email!,
                auto_recurring: {
                    frequency: 1,
                    frequency_type: 'months',
                    transaction_amount: 5000, // Precio ejemplo
                    currency_id: 'ARS'
                },
                back_url: `${process.env.APP_URL}/dashboard?subscription=success`,
            }
        });

        // Save preapproval_id to subscription
        await prisma.subscription.update({
            where: { companyId: company.id },
            data: {
                mpPreapprovalPlanId: process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID!,
                mpPreapprovalId: response.id
            }
        });

        return NextResponse.json({
            checkoutUrl: response.init_point,
            preapprovalId: response.id
        });
    } catch (error: any) {
        console.error('Mercado Pago error:', error);
        return NextResponse.json(
            { error: 'Error creando suscripción', details: error.message },
            { status: 500 }
        );
    }
}
