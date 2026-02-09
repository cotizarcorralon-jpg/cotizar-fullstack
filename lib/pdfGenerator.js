import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (company, items, total) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // -- Helper for centering text --
        const centerText = (text, y, size = 10, font = 'normal', color = [0, 0, 0]) => {
            doc.setFontSize(size);
            doc.setFont("helvetica", font);
            doc.setTextColor(...color);
            doc.text(text, pageWidth / 2, y, { align: 'center' });
        };

        // 0. BACKGROUND
        if (company.pdfBackground) {
            try {
                // Background covers the full page
                doc.addImage(company.pdfBackground, 'JPEG', 0, 0, pageWidth, pageHeight);
            } catch (e) {
                console.warn("PDF Background error", e);
            }
        }

        // 1. HEADER
        let y = 20;

        // -- RIGHT ZONE: DATE --
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120);
        doc.text("Fecha de emisión", pageWidth - margin, y, { align: 'right' });

        const dateStr = new Date().toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).replace(',', ' ·');

        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(dateStr, pageWidth - margin, y + 5, { align: 'right' });


        // -- LEFT ZONE: IDENTITY --
        // Only draw standard header if NO background is present. 
        // If background is present, we assume it contains the Logo/Brand info.
        if (!company.pdfBackground) {
            // If logo exists
            if (company.logo) {
                try {
                    doc.addImage(company.logo, 'JPEG', margin, y - 5, 20, 20);
                } catch (e) {
                    console.warn("Logo error", e);
                }
            }

            // Name
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0);
            doc.text(company.name || "Nombre Empresa", pageWidth / 2, y + 2, { align: 'center' });

            // Stacked Contact Info
            let contactY = y + 10;
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80);

            // Helper to add line if exists
            const addContactLine = (prefix, val) => {
                if (val) {
                    doc.text(`${prefix} ${val}`, pageWidth / 2, contactY, { align: 'center' });
                    contactY += 5;
                }
            };

            addContactLine("Tel:", company.whatsapp);
            addContactLine("Email:", company.email);
            addContactLine("Web:", company.web);

            // Calculate bottom of header (ensure it clears logo and contact info)
            y = Math.max(contactY, y + 25) + 5;

            // -- SEPARATOR --
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
        } else {
            // If background exists, just push Y down to start of content area (approx 1/3 of page or variable)
            // Let's assume a standard header height for letterheads ~ 40mm
            y = 50;
        }

        // -- TITLE SECTION (Below Separator/Header) --

        // -- TITLE SECTION (Below Separator) --
        y += 15;
        centerText("COTIZACIÓN", y, 14, 'bold', [0, 0, 0]);

        y += 6;
        const budgetId = `Nº ${Date.now().toString().slice(-6)}`;
        centerText(`Presupuesto ${budgetId}`, y, 10, 'normal', [100, 100, 100]);

        // 3. INTERPRETATION BLOCK
        y += 15;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Interpretación del pedido", margin, y);

        y += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        doc.text(`Materiales para obra · ${items.length} ítems detectados`, margin, y);

        // 4. DETAIL TABLE
        y += 10;

        const tableColumns = [
            { header: 'Material', dataKey: 'name' },
            { header: 'Cantidad', dataKey: 'qty' },
            { header: 'Precio Unitario', dataKey: 'price' },
            { header: 'Subtotal', dataKey: 'subtotal' },
        ];

        const tableRows = items.map(item => ({
            name: item.name,
            qty: `${item.quantity} ${item.unit}`,
            price: `$ ${item.price.toLocaleString('es-AR')}`,
            subtotal: `$ ${item.subtotal.toLocaleString('es-AR')}`
        }));

        autoTable(doc, {
            startY: y,
            columns: tableColumns,
            body: tableRows,
            theme: 'plain', // Clean minimalist style
            styles: {
                font: 'helvetica',
                fontSize: 9,
                cellPadding: 4,
                textColor: [50, 50, 50],
                lineColor: [230, 230, 230],
                lineWidth: 0.1, // Soft lines
            },
            headStyles: {
                fillColor: [250, 250, 250],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            columnStyles: {
                name: { cellWidth: 'auto', fontStyle: 'bold' },
                qty: { cellWidth: 30, halign: 'center' },
                price: { cellWidth: 35, halign: 'right' },
                subtotal: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
            },
            didDrawPage: (data) => {
                // Optional footer on each page if needed
            }
        });

        // 5. TOTAL SECTION
        let finalY = doc.lastAutoTable.finalY + 15;

        // Check page break
        if (finalY > pageHeight - 40) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("TOTAL ESTIMADO", pageWidth - margin, finalY, { align: 'right' });

        y = finalY + 8;
        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.text(`$ ${total.toLocaleString('es-AR')}`, pageWidth - margin, y, { align: 'right' });

        y += 6;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text("IVA incluido", pageWidth - margin, y, { align: 'right' });

        // 6. FOOTER
        const footerText = company.terms || "Presupuesto válido por 48 hs. Precios sujetos a stock y variaciones. Flete no incluido.";

        doc.setFontSize(8);
        doc.setTextColor(150);
        // Position at bottom of page
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });


        // OUTPUT
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                iframe.contentWindow.print();
            } catch (e) {
                console.error("Print failed", e);
                window.open(blobUrl, '_blank');
            }
        };

    } catch (err) {
        console.error("PDF Generation Error:", err);
        alert("Hubo un error generando el PDF: " + err.message);
    }
};
