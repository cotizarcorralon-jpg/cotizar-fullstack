import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "cotizAR - Tu sistema de presupuestos inteligente",
    description: "Generá presupuestos profesionales en segundos desde mensajes de WhatsApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
