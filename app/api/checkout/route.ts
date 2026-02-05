
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { companyId, email } = body;

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // ... (lines 14-38 omitted for brevity, keeping them as is)

        const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                reason: "Cotizador Corralon PRO",
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    transaction_amount: 19900,
                    currency_id: "ARS"
                },
                // Mercado Pago requiere HTTPS. Si es localhost, usamos la de producción como fallback para no romper la validación.
                back_url: (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost"))
                    ? process.env.NEXTAUTH_URL
                    : "https://cotizapp.click",
                external_reference: companyId,
                payer_email: "test_user_2419455401@testuser.com",
                status: "pending"
            })
        });

        const data = await mpResponse.json();

        if (!mpResponse.ok) {
            console.error("MP Error Status:", mpResponse.status);
            console.error("MP Error Data:", JSON.stringify(data, null, 2));
            return NextResponse.json({ error: 'Error creating subscription', details: data }, { status: 500 });
        }

        // Devolvemos el link de pago generado (init_point)
        return NextResponse.json({ url: data.init_point });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
