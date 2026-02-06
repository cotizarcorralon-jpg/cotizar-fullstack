import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "CotizApp | Cotizador con IA para Corralones y Materiales de Construcción",
    description: "Generá presupuestos de obra en segundos. El software para corralones que interpreta pedidos de WhatsApp con IA. Probá el cotizador de materiales gratis.",
    keywords: ["cotizador ia", "corralon", "materiales construccion", "prespuestos obra", "cotizapp", "software corralon", "ia para ventas"],
    icons: {
        icon: '/favicon.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "CotizApp",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "ARS"
        },
        "description": "Herramienta con IA para cotizar materiales de construcción automáticamente desde WhatsApp.",
        "featureList": "IA, PDF automático, Presupuestos rápidos, Corralones"
    };

    return (
        <html lang="es">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
