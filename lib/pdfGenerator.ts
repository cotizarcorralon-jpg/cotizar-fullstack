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
    const fileName = quoteNumber ? `cotizacion_${quoteNumber}.pdf` : `cotizacion_${Date.now()}.pdf`;
    const doc = createDoc(company, items, total, quoteNumber);
    doc.save(fileName);
}

export function getPDFBlobUrl(
    company: Company,
    items: QuoteItem[],
    total: number,
    quoteNumber?: string
): string {
    const doc = createDoc(company, items, total, quoteNumber);
    return doc.output('bloburl') as unknown as string;
}

function createDoc(
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

    // Header: Logo (if exists)
    const logo = (company as any).logo || company.logoUrl;
    if (logo && logo.startsWith('data:image')) {
        try {
            const imgProps = doc.getImageProperties(logo);
            const imgWidth = 40;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            doc.addImage(logo, 'PNG', (pageWidth - imgWidth) / 2, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5;
        } catch (e) {
            console.error("Error adding logo to PDF", e);
        }
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

    const website = company.website || (company as any).web;
    if (website) {
        doc.text(website, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    // Date (right aligned)
    const dateStr = new Date().toLocaleDateString('es-AR');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0); // Black for date
    doc.text(dateStr, pageWidth - marginRight, 20, { align: 'right' });

    // Quote Number (Subtle, below date)
    if (quoteNumber) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100); // Grey
        doc.text(`${quoteNumber}`, pageWidth - marginRight, 24, { align: 'right' });
        doc.setTextColor(0, 0, 0); // Reset to black
    }

    yPos += 5;
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    yPos += 10;

    // Title: Cotización de materiales
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Cotización de materiales', marginLeft, yPos);
    yPos += 10;

    // Table
    autoTable(doc, {
        startY: yPos,
        head: [['Material', 'Cantidad', 'Precio Unit.', 'Subtotal']],
        body: items.map(item => {
            // Map price/unitPrice safe fallback
            const price = (item as any).price || item.unitPrice || 0;
            const sub = item.subtotal || 0;
            return [
                item.name,
                `${item.quantity} ${item.unit}`,
                `$ ${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
                `$ ${sub.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
            ];
        }),
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
    const terms = (company as any).terms || company.pdfTerms || 'Presupuesto válido por 7 días. Flete NO incluido.';
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text(terms, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - marginLeft - marginRight });

    return doc;
}
