
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

        // Usamos el link del Plan Preaprobado YA EXISTENTE (fijo)
        // Le adjuntamos la referencia externa (companyId) para saber quién pagó
        const planId = "f03e1a6abedd4f1fba4947305b598264";
        const url = `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=${planId}&external_reference=${companyId}`;

        // Devolvemos el link directo
        return NextResponse.json({ url });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
