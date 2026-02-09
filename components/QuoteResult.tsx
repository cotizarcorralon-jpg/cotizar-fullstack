'use client';

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with react-pdf (DOMMatrix error)
const MobilePdfViewer = dynamic(() => import('./MobilePdfViewer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Cargando visor PDF...</div>
});

type QuoteItem = {
  quantity: number;
  unit: string;
  name: string;
  price: number;
  subtotal: number;
};

type CompanyInfo = {
  name?: string;
  address?: string;
  whatsapp?: string;
  email?: string;
  logoUrl?: string;
};

type QuoteResultProps = {
  items: QuoteItem[];
  total: number;
  company?: CompanyInfo;
  onUpdateItem: (index: number, field: string, value: any) => void;
  onAddItem: () => void;
  onDownload: () => void;
  showPalletInfo: boolean;
  isDemo: boolean;
};

export default function QuoteResult(props: QuoteResultProps) {
  const {
    items,
    total,
    onUpdateItem,
    onAddItem,
    onDownload,
    showPalletInfo,
    isDemo
  } = props;

  const { company } = props;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(300);

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Ajustar width para el PDF (ancho de pantalla menos padding aproximado)
      setContainerWidth(Math.min(window.innerWidth - 48, 600));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section style={{ padding: '0 0 60px 0' }}>
      <div className="container">
        <div
          className="card"
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            borderTop: '4px solid var(--primary)'
          }}
        >
          {isDemo && (
            <div
              style={{
                background: '#f0f9ff',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #bae6fd'
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#0369a1',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ℹ️ Estas viendo una vista previa. Los precios son estimados. Creá tu cuenta para editar materiales y configurar tu empresa.
              </p>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Interpretación del pedido
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Se detectaron {items.length} ítems. Revisá los precios si es necesario.
            </p>
          </div>

          {showPalletInfo && (
            <div
              style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #ffedd5',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <h4
                style={{
                  color: '#ea580c',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
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
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateItem(idx, 'quantity', Number.parseFloat(e.target.value) || 0)}
                        style={{
                          width: '60px',
                          padding: '4px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => onUpdateItem(idx, 'unit', e.target.value)}
                        style={{
                          width: '50px',
                          padding: '4px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => onUpdateItem(idx, 'name', e.target.value)}
                        style={{
                          width: '100%',
                          minWidth: '150px',
                          padding: '4px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)'
                        }}
                      />
                    </td>

                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <span>$</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => onUpdateItem(idx, 'price', Number.parseFloat(e.target.value) || 0)}
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
                  <td style={{ padding: '1.5rem 0.75rem', textAlign: 'right', fontSize: '1.1rem' }}>
                    Total Final:
                  </td>
                  <td
                    style={{
                      padding: '1.5rem 0.75rem',
                      textAlign: 'right',
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: 'var(--primary)'
                    }}
                  >
                    ${total.toLocaleString('es-AR')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.75rem 1rem',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px dashed #4ade80'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#15803d', fontWeight: 500 }}>
              ¿Faltó algún material? Si algo no salió en la lista, puedes agregarlo desde aquí:
            </p>
            <button
              onClick={onAddItem}
              title="Agregar ítem manualmente"
              style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.5rem',
                lineHeight: '1',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                paddingBottom: '2px'
              }}
            >
              +
            </button>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
            {/* Preview Button */}
            <button
              className="btn btn-secondary"
              onClick={async () => {
                // Lazy load generator
                const { getPDFBlobUrl } = await import('@/lib/pdfGenerator');

                // Helper map for strict typing match
                const pdfItems = items.map(i => ({
                  name: i.name,
                  quantity: i.quantity,
                  unit: i.unit,
                  unitPrice: i.price,
                  subtotal: i.subtotal
                }));

                const url = getPDFBlobUrl(
                  // Ensure we pass minimal defaults if company is missing or name is undefined
                  { ...({ name: 'Mi Empresa' }), ...(company || {}) } as any,
                  pdfItems,
                  total
                );
                setPreviewUrl(String(url));
              }}
              style={{ padding: '0.8rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              👁️ Ver Vista Previa
            </button>

            <button className="btn btn-primary" onClick={onDownload} style={{ padding: '1rem 2rem' }}>
              <Download size={20} />
              Descargar PDF
            </button>
          </div>

          {/* PDF Preview Area */}
          {previewUrl && (
            <div style={{ marginTop: '2rem', borderTop: '2px solid var(--border)', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Vista Previa del PDF</h4>
                <button onClick={() => setPreviewUrl(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>❌ Cerrar</button>
              </div>

              {isMobile ? (
                /* Mobile: Usar react-pdf via Dynamic Import para evitar error SSR */
                <MobilePdfViewer url={previewUrl} width={containerWidth} />
              ) : (
                /* Desktop: Usar iframe nativo (Browser PDF Viewer) */
                <iframe
                  src={previewUrl}
                  style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '8px' }}
                  title="Vista Previa PDF"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
