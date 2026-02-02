'use client';

import { signIn } from 'next-auth/react';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="card max-w-md w-full text-center shadow-lg">
                <h1 className="text-4xl font-extrabold text-blue-600 mb-2">cotizAR</h1>
                <p className="text-gray-600 mb-8">
                    Presupuestos profesionales en segundos
                </p>

                <button
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    className="btn btn-primary w-full justify-center text-lg py-4"
                >
                    <Chrome size={24} />
                    Continuar con Google
                </button>

                <p className="text-sm text-gray-500 mt-6">
                    Al iniciar sesión, aceptás nuestros términos de servicio
                </p>
            </div>
        </div>
    );
}
