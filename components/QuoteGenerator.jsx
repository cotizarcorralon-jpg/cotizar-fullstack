import React, { useState } from 'react';
import { Zap, Play, Trash2, Lock } from 'lucide-react';

export default function QuoteGenerator({ plan, onGenerate, onClear, onExample, isDemo, demoQuoteCount }) {
    const [text, setText] = useState('');

    const handleGenerateClick = () => {
        // Allow clicking even if text is empty if limit is reached (to trigger modal)
        // But parent handleGenerate checks text? Only if calling API.
        // If limit reached, parent uses 'limit' reason from demoUsed state.
        // Actually parent handleGenerate takes 'text'.

        if (plan !== 'DemoLimit' && !text.trim()) return;
        onGenerate(text);
    };

    const handleExampleClick = () => {
        const example = "Hola, necesito cotizar:\n10 bolsas de cemento\n2 m3 de arena\n1 pallet de ladrillo 12\n5 barras de hierro 8mm";
        setText(example);
    };

    const handleClearClick = () => {
        setText('');
        onClear();
    };

    const isPro = plan === 'Profesional';
    const isDemoLimit = plan === 'DemoLimit';

    return (
        <section id="quote-generator" style={{ padding: '20px 0' }}>
            <div className="container">
                <div className="card" style={{ maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>

                    {/* Header of Card */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: '1rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Nuevo Presupuesto</h2>

                        {/* Plan Badge */}
                        <div className={`badge ${isPro ? 'badge-green' : 'badge-gray'}`} style={
                            (isDemo || plan === 'Guest') ? { background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' } :
                                isDemoLimit ? { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' } : {}
                        }>
                            {isDemoLimit ? (
                                <>
                                    <Lock size={14} style={{ marginRight: '4px' }} />
                                    Límite Demo Alcanzado
                                </>
                            ) : (isDemo || plan === 'Guest') ? (
                                `Gratis: ${demoQuoteCount || 0} de 3 cotizaciones`
                            ) : isPro ? (
                                <>
                                    <Zap size={14} style={{ marginRight: '4px' }} fill="currentColor" />
                                    Plan Profesional activo
                                </>
                            ) : (
                                "Plan Free"
                            )}
                        </div>
                    </div>

                    {/* Text Area */}
                    <textarea
                        className="input"
                        rows={6}
                        placeholder={isDemoLimit ? "Creá tu cuenta para seguir cotizando..." : "Ej: Hola, necesito materiales para una losa de 50 metros cuadrados. Serían 10 bolsas de cemento, arena..."}
                        style={{
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            fontSize: '1.1rem',
                            marginBottom: '1.5rem',
                            opacity: isDemoLimit ? 0.7 : 1
                        }}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isDemoLimit}
                    />

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            className={`btn ${isDemoLimit ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={handleGenerateClick}
                            style={{ flex: 1, minWidth: '200px' }}
                        >
                            {isDemoLimit ? (
                                <>
                                    <Lock size={18} />
                                    Para seguir, creá tu cuenta
                                </>
                            ) : (
                                <>
                                    <Play size={18} fill="currentColor" />
                                    Generar presupuesto
                                </>
                            )}
                        </button>

                        {!isDemoLimit && (
                            <>
                                <button className="btn btn-secondary" onClick={handleExampleClick}>
                                    Usar ejemplo
                                </button>

                                <button className="btn btn-ghost" onClick={handleClearClick}>
                                    <Trash2 size={18} />
                                    Limpiar
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}
