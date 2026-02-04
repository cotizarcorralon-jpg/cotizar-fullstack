
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        console.log(`Webhook recibido: ${topic} - ${id}`);

        if (topic === 'preapproval') {
            // 1. Consultamos a Mercado Pago usando GET para ver de quién es esta suscripción
            const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
                }
            });

            const data = await mpResponse.json();

            if (mpResponse.ok) {
                // 2. Extraemos el ID del usuario que guardamos antes
                const companyId = data.external_reference;
                const status = data.status;

                console.log(`Suscripción detectada: Usuario ${companyId} - Estado ${status}`);

                // 3. Si el estado es "authorized" (activo), activamos el plan PRO
                if (status === 'authorized' && companyId) {

                    await prisma.company.update({
                        where: { id: companyId },
                        data: { plan: 'Profesional' }
                    });

                    console.log(`¡PLAN PRO ACTIVADO PARA ${companyId}!`);
                }
            }
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
    }
}
