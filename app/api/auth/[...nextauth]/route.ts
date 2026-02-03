import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const authHandler = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
});

export const GET = authHandler.handlers.GET;
export const POST = authHandler.handlers.POST;
