import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import MercadoPagoConfig, { PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        console.log('Webhook received:', body);

        // Mercado Pago sends different event types
        // We're interested in: preapproval, authorized_payment, etc.
        const { type, data } = body;

        if (type === 'preapproval') {
            const preapprovalId = data.id;

            // Fetch the actual preapproval status from Mercado Pago
            const preApproval = new PreApproval(client);
            const subscriptionData = await preApproval.get({ id: preapprovalId });

            const externalReference = subscriptionData.external_reference;
            const status = subscriptionData.status;

            console.log('Preapproval status:', status, 'for company:', externalReference);

            if (!externalReference) {
                console.error('No external_reference in subscription');
                return NextResponse.json({ error: 'No external reference' }, { status: 400 });
            }

            // Find subscription by companyId (external_reference)
            const subscription = await prisma.subscription.findUnique({
                where: { companyId: externalReference }
            });

            if (!subscription) {
                console.error('Subscription not found for company:', externalReference);
                return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
            }

            // Update subscription based on status
            if (status === 'authorized') {
                // Activate PRO plan
                await prisma.subscription.update({
                    where: { companyId: externalReference },
                    data: {
                        plan: 'PRO',
                        status: 'active',
                        mpPreapprovalId: preapprovalId
                    }
                });
                console.log('✅ PRO activated for company:', externalReference);
            } else if (status === 'cancelled' || status === 'paused') {
                // Downgrade to FREE
                await prisma.subscription.update({
                    where: { companyId: externalReference },
                    data: {
                        plan: 'FREE',
                        status: 'inactive'
                    }
                });
                console.log('⚠️ Subscription cancelled/paused for company:', externalReference);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
