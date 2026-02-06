'use client';

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configurar el worker de PDF.js para que funcione sin configuración extra de webpack
// Usamos unpkg como CDN confiable
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface MobilePdfViewerProps {
    url: string;
    width: number;
}

export default function MobilePdfViewer({ url, width }: MobilePdfViewerProps) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            minHeight: '300px'
        }}>
            <Document
                file={url}
                loading={<div style={{ padding: '20px', color: '#64748b' }}>Cargando documento...</div>}
                error={<div style={{ padding: '20px', color: '#ef4444' }}>No se pudo cargar la vista previa. Por favor descargá el PDF.</div>}
            >
                <Page
                    pageNumber={1}
                    width={width}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                />
            </Document>
        </div>
    );
}
