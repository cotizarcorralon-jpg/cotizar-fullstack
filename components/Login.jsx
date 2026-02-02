import React, { useState } from 'react';
import { LayoutGrid, User, Plus } from 'lucide-react';

export default function Login({ onLogin, isModal }) {
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAccountSelect = async (account) => {
        setIsGoogleModalOpen(false);
        setIsLoading(true);

        // Simulate Network Delay
        setTimeout(async () => {
            await onLogin(account);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div style={{
            height: isModal ? 'auto' : '100vh',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: isModal ? 'transparent' : '#f8fafc',
            padding: isModal ? '1rem' : '0'
        }}>

            {/* Main Login Card */}
            <div className="card" style={{
                maxWidth: '400px', width: '100%', textAlign: 'center',
                padding: isModal ? '1.5rem' : '3rem',
                boxShadow: isModal ? 'none' : undefined
            }}>
                {/* Branding - Hide if Modal */}
                {!isModal && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
                                <LayoutGrid color="white" size={32} />
                            </div>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>cotizAR</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Tu sistema de presupuestos inteligente.</p>
                    </>
                )}

                <button
                    className="btn"
                    onClick={() => setIsGoogleModalOpen(true)}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        color: '#475569',
                        position: 'relative',
                        padding: '12px'
                    }}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.13c-.22-.66-.35-1.36-.35-2.13s.13-1.47.35-2.13V7.03H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.97l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.03l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
                </button>

                <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Al continuar aceptás los términos y condiciones.
                </p>
            </div>

            {/* Simulated Google Picker Modal */}
            {isGoogleModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '8px',
                        width: '100%', maxWidth: '400px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Google Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.5rem' }}>
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.13c-.22-.66-.35-1.36-.35-2.13s.13-1.47.35-2.13V7.03H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.97l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.03l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1e293b' }}>Ir a cotizAR</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Ingresá tus datos para continuar</p>
                        </div>

                        {/* Input Fields */}
                        <div style={{ padding: '2rem' }}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleAccountSelect({
                                    email: formData.get('email'),
                                    name: formData.get('name'),
                                    googleId: 'simulated-' + Date.now()
                                });
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.4rem', color: '#334155' }}>
                                        Tu correo electrónico
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="ejemplo@email.com"
                                        className="input"
                                        style={{ width: '100%', padding: '0.6rem' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.4rem', color: '#334155' }}>
                                        Tu nombre completo
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Tu Nombre"
                                        className="input"
                                        style={{ width: '100%', padding: '0.6rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => setIsGoogleModalOpen(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
