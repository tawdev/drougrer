import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Order } from './order.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
    async generateOrderPdf(order: Order): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new (PDFDocument as any)({
                size: 'A4',
                margin: 50,
                bufferPages: true,
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // --- Header ---
            this.generateHeader(doc);
            
            // --- Customer & Order Info ---
            this.generateCustomerInformation(doc, order);
            
            // --- Invoice Table ---
            this.generateInvoiceTable(doc, order);
            
            // --- Footer ---
            this.generateFooter(doc);

            doc.end();
        });
    }

    private generateHeader(doc: PDFKit.PDFDocument) {
        // Brand Color: #BF1737 (Red)
        doc
            .fillColor('#BF1737')
            .fontSize(24)
            .text('MOL DROGUERIE', 50, 45, { align: 'left' })
            .fillColor('#444444')
            .fontSize(10)
            .text('Droguerie Maroc - Casablanca', 50, 75, { align: 'left' })
            .text('Email: admin@drogueriemaroc.com', 50, 90, { align: 'left' })
            .moveDown();
            
        // Horizontal Line
        doc
            .strokeColor('#eeeeee')
            .lineWidth(1)
            .moveTo(50, 115)
            .lineTo(550, 115)
            .stroke();
    }

    private generateCustomerInformation(doc: PDFKit.PDFDocument, order: Order) {
        const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        doc
            .fillColor('#BF1737')
            .fontSize(16)
            .text('Rapport de Commande', 50, 140)
            .moveDown();

        const top = 180;
        doc
            .fontSize(10)
            .fillColor('#777777')
            .text('Référence:', 50, top)
            .fillColor('#000000')
            .font('Helvetica-Bold')
            .text(order.invoiceReference || `ORD-${order.id}`, 150, top)
            .font('Helvetica')
            
            .fillColor('#777777')
            .text('Date:', 50, top + 15)
            .fillColor('#000000')
            .text(orderDate, 150, top + 15)
            
            .fillColor('#777777')
            .text('Status:', 50, top + 30)
            .fillColor('#BF1737')
            .font('Helvetica-Bold')
            .text(order.status.toUpperCase(), 150, top + 30)
            .font('Helvetica')

            // Customer Box
            .fillColor('#f9fafb')
            .rect(320, 140, 230, 90)
            .fill()
            .fillColor('#000000')
            .font('Helvetica-Bold')
            .text('Informations Client', 330, 150)
            .font('Helvetica')
            .fontSize(9)
            .text(`Nom: ${order.customerName}`, 330, 170)
            .text(`Email: ${order.email}`, 330, 185)
            .text(`Tél: ${order.phone || 'N/A'}`, 330, 200)
            .text(`Adresse: ${order.address || 'N/A'}`, 330, 215, { width: 210 })
            
            .moveDown();
    }

    private generateInvoiceTable(doc: PDFKit.PDFDocument, order: Order) {
        let i;
        const invoiceTableTop = 280;

        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            invoiceTableTop,
            'Article',
            'Prix Unit.',
            'Qté',
            'Sous-Total'
        );
        this.generateHr(doc, invoiceTableTop + 20);
        doc.font('Helvetica');

        const items = order.items as any[];
        for (i = 0; i < items.length; i++) {
            const item = items[i];
            const position = invoiceTableTop + (i + 1) * 30;
            this.generateTableRow(
                doc,
                position,
                item.name,
                `${Number(item.price).toFixed(2)} MAD`,
                item.quantity.toString(),
                `${(Number(item.price) * item.quantity).toFixed(2)} MAD`
            );

            this.generateHr(doc, position + 20);
        }

        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            subtotalPosition,
            '',
            '',
            'TOTAL TTC',
            `${Number(order.totalPrice).toFixed(2)} MAD`
        );
    }

    private generateFooter(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(10)
            .fillColor('#777777')
            .text(
                'Ceci est un rapport administratif généré automatiquement.',
                50,
                780,
                { align: 'center', width: 500 }
            );
    }

    private generateTableRow(
        doc: PDFKit.PDFDocument,
        y: number,
        item: string,
        price: string,
        quantity: string,
        total: string
    ) {
        doc
            .fontSize(10)
            .text(item, 50, y, { width: 280 })
            .text(price, 330, y, { width: 90, align: 'right' })
            .text(quantity, 420, y, { width: 40, align: 'right' })
            .text(total, 0, y, { align: 'right' });
    }

    private generateHr(doc: PDFKit.PDFDocument, y: number) {
        doc
            .strokeColor('#eeeeee')
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }
}
