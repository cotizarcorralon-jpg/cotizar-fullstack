import React from 'react';
import { Download } from 'lucide-react';

export default function QuoteResult({ items, onUpdateItem, total, onDownload, showPalletInfo, isDemo }) {
    if (!items || items.length === 0) return null;

    return (
        <section style={{ padding: '0 0 60px 0' }}>
            <div className="container">
                <div className="card" style={{ maxWidth: '800px', margin: '0 auto', borderTop: '4px solid var(--primary)' }}>

                    {isDemo && (
                        <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bae6fd' }}>
                            <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ℹ️ Estas viendo una vista previa. Los precios son estimados. Creá tu cuenta para editar materiales y configurar tu empresa.
                            </p>
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Interpretación del pedido</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Se detectaron {items.length} ítems. Revisá los precios si es necesario.
                        </p>
                    </div>

                    {showPalletInfo && (
                        <div style={{
                            backgroundColor: '#fff7ed',
                            border: '1px solid #ffedd5',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <h4 style={{ color: '#ea580c', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                📦 Aclaración sobre pallets
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: '#431407', marginBottom: '0.5rem' }}>
                                Interpretamos el pedido usando cantidades estándar por pallet:
                            </p>
                            <ul style={{ fontSize: '0.9rem', color: '#7c2d12', paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>
                                <li>Ladrillo 8 → 216 unidades</li>
                                <li>Ladrillo 12 → 144 unidades</li>
                                <li>Ladrillo 18 → 90 unidades</li>
                            </ul>
                            <p style={{ fontSize: '0.85rem', color: '#9a3412', fontStyle: 'italic' }}>
                                Si su proveedor maneja otra cantidad, puede corregir el precio unitario antes de generar el presupuesto.
                            </p>
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-sub)' }}>Cantidad</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-sub)' }}>Unidad</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-sub)' }}>Material</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-sub)', textAlign: 'right' }}>Precio Unit.</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-sub)', textAlign: 'right' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{item.quantity}</td>
                                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {item.unit.toLowerCase() === 'unidad' || item.unit.toLowerCase() === 'u' ? 'U' : item.unit}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{item.name}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                                <span>$</span>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => onUpdateItem(idx, parseFloat(e.target.value) || 0)}
                                                    style={{
                                                        width: '90px',
                                                        padding: '4px',
                                                        textAlign: 'right',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--border)'
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                                            ${item.subtotal.toLocaleString('es-AR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3}></td>
                                    <td style={{ padding: '1.5rem 0.75rem', textAlign: 'right', fontSize: '1.1rem' }}>Total Final:</td>
                                    <td style={{ padding: '1.5rem 0.75rem', textAlign: 'right', fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                                        ${total.toLocaleString('es-AR')}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={onDownload} style={{ padding: '1rem 2rem' }}>
                            <Download size={20} />
                            Descargar PDF
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
}
