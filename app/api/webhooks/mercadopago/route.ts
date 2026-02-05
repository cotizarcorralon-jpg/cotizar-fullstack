
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        let topic = url.searchParams.get('topic') || url.searchParams.get('type');
        let id = url.searchParams.get('id') || url.searchParams.get('data.id');

        // Intento leer el body si faltan datos en la URL
        if (!topic || !id) {
            try {
                const body = await req.json();
                console.log("Webhook Body:", JSON.stringify(body));
                topic = topic || body.topic || body.type;
                id = id || body.id || (body.data && body.data.id);
            } catch (e) {
                console.log("Error leyendo body del webhook o body vacío");
            }
        }

        console.log(`Webhook procesado: ${topic} - ${id}`);

        if (topic === 'preapproval' || topic === 'subscription_preapproval') {
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
            } else {
                console.error("Error consultando MP:", data);
            }
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
    }
}
