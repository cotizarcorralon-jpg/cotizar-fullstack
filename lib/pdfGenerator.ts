import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Company {
    name: string;
    address?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    pdfTerms?: string | null;
}

interface QuoteItem {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
}

export function generatePDF(
    company: Company,
    items: QuoteItem[],
    total: number,
    quoteNumber?: string
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const marginLeft = 15;
    const marginRight = 15;

    let yPos = 20;

    // Header: Logo (if exists), Company Name, Date
    if (company.logoUrl) {
        // Note: In production, you'd need to handle image loading async
        // For now, we'll skip the logo or use a placeholder
    }

    // Company Name (centered)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(company.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (company.address) {
        doc.text(company.address, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    if (company.whatsapp || company.email) {
        const contact = [company.whatsapp, company.email].filter(Boolean).join(' | ');
        doc.text(contact, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    if (company.website) {
        doc.text(company.website, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    // Date (right aligned)
    const dateStr = new Date().toLocaleDateString('es-AR');
    doc.setFontSize(9);
    doc.text(dateStr, pageWidth - marginRight, 20, { align: 'right' });

    yPos += 5;
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    yPos += 10;

    // Title: COTIZACIÓN
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN' + (quoteNumber ? ` #${quoteNumber}` : ''), marginLeft, yPos);
    yPos += 10;

    // Table
    autoTable(doc, {
        startY: yPos,
        head: [['Material', 'Cantidad', 'Precio Unit.', 'Subtotal']],
        body: items.map(item => [
            item.name,
            `${item.quantity} ${item.unit}`,
            `$ ${item.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
            `$ ${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        margin: { left: marginLeft, right: marginRight },
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 10;

    // Total
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(
        `TOTAL: $ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        pageWidth - marginRight,
        yPos,
        { align: 'right' }
    );
    yPos += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('IVA incluido', pageWidth - marginRight, yPos, { align: 'right' });
    yPos += 10;

    // Terms
    const terms = company.pdfTerms || 'Presupuesto válido por 7 días. Flete NO incluido.';
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitTerms = doc.splitTextToSize(terms, pageWidth - marginLeft - marginRight);
    doc.text(splitTerms, marginLeft, yPos);

    // Download
    doc.save(`cotizacion_${Date.now()}.pdf`);
}
