import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const { handlers } = NextAuth({
    trustHost: true,
    debug: true, // Activar logs detallados en Vercel
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    // Configuración de proveedores: Google Auth 
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: { strategy: "jwt" },

    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id; // ✅ guarda el id del user en el token
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // ✅ expone el id en session.user.id
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
});

export const { GET, POST } = handlers;
