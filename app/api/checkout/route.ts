
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { companyId } = body;

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // Datos de tu plan actual (usamos los mismos valores que tenías en el link fijo)
        // ID del plan original: f03e1a6abedd4f1fba4947305b598264
        // Sin embargo, para trackear el usuario, necesitamos crear una "solicitud de suscripcion" (preapproval)
        // específica para este usuario, basada en ese plan o defininiendo las props aquí.

        // NOTA: Para usar external_reference con suscripciones, lo ideal es crear un "preapproval" 
        // dinámico apuntando al plan o definiendo el precio on-the-fly.
        // Como MercadoPago a veces restringe `preapproval_plan_id` + `external_reference`,
        // crearemos una preferencia de suscripción directa.

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
                back_url: process.env.NEXTAUTH_URL || "https://cotizar-fullstack.vercel.app",
                external_reference: companyId, // <--- AQUÍ ESTÁ LA CLAVE: Guardamos el ID de tu usuario
                payer_email: "test_user_123@test.com", // MercadoPago requiere un email, idealmente usar el del user real
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
