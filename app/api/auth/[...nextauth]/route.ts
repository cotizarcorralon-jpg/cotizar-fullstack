import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Check if user already has a company
            const existingMembership = await prisma.companyMember.findFirst({
                where: { userId: user.id },
                include: { company: true }
            });

            if (!existingMembership) {
                // First login: create Company + Subscription + Membership + Usage
                const company = await prisma.company.create({
                    data: {
                        name: user.name || 'Mi Empresa',
                        email: user.email || '',
                    }
                });

                await prisma.companyMember.create({
                    data: {
                        companyId: company.id,
                        userId: user.id!,
                        role: 'owner'
                    }
                });

                await prisma.subscription.create({
                    data: {
                        companyId: company.id,
                        plan: 'FREE',
                        status: 'active'
                    }
                });

                const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
                await prisma.usage.create({
                    data: {
                        companyId: company.id,
                        monthKey,
                        quoteCount: 0
                    }
                });
            }

            return true;
        },
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;

                // Get user's company
                const membership = await prisma.companyMember.findFirst({
                    where: { userId: user.id },
                    include: {
                        company: {
                            include: {
                                subscription: true
                            }
                        }
                    }
                });

                if (membership) {
                    (session as any).companyId = membership.companyId;
                    (session as any).role = membership.role;
                    (session as any).plan = membership.company.subscription?.plan || 'FREE';
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'database',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
