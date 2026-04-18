import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Order } from '../orders/order.entity';

@Injectable()
export class MailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.initializeTransporter();
    }

    async onModuleInit() {
        await this.verifyConnection();
    }

    private initializeTransporter() {
        const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
        const port = this.configService.get<number>('SMTP_PORT') || 587;
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');

        if (!user || !pass) {
            this.logger.error('CRITICAL: SMTP_USER or SMTP_PASS missing in .env. Emails disabled.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // Use SSL for port 465, TLS/STARTTLS for 587
            auth: {
                user,
                pass,
            },
            tls: {
                rejectUnauthorized: false // Often needed for local dev/different environments
            }
        });
    }

    private async verifyConnection() {
        if (!this.transporter) return;

        try {
            await this.transporter.verify();
            this.logger.log('✅ Connection SMTP vérifiée avec succès ! Prêt à envoyer des factures.');
        } catch (error) {
            this.logger.error('❌ Échec de la connexion SMTP. Vérifiez votre App Password ou port Gmail.', error.message);
        }
    }

    async sendInvoice(order: Order) {
        if (!order.email) {
            this.logger.warn(`Skip sending invoice: No email for order #${order.id}`);
            return;
        }

        if (!this.transporter) {
            this.logger.error(`Mailing system not initialized. Could not send invoice for order #${order.id}`);
            return;
        }
        const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #4a5568;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center; font-size: 14px; color: #4a5568;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-size: 14px; color: #4a5568;">${Number(item.price).toFixed(2)} MAD</td>
                <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-size: 14px; color: #1a202c; font-weight: bold;">${(Number(item.price) * item.quantity).toFixed(2)} MAD</td>
            </tr>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 0; background-color: #f7fafc; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                    .header { background: #BF1737; padding: 40px 20px; text-align: center; color: #ffffff; }
                    .content { padding: 40px; }
                    .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
                    h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase; }
                    .invoice-info { margin-bottom: 32px; flex-direction: row; justify-content: space-between; display: flex; }
                    .total-box { margin-top: 32px; padding: 20px; background: #fdf2f2; border-radius: 12px; text-align: right; }
                    .table { width: 100%; border-collapse: collapse; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Facture de Commande</h1>
                        <p style="margin-top: 8px; opacity: 0.8; font-weight: bold;">${order.invoiceReference || 'FAC-' + order.id}</p>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>${order.customerName}</strong>,</p>
                        <p>Nous avons le plaisir de vous confirmer la réception et la validation de votre commande chez <strong>Droguerie Maroc</strong>.</p>
                        
                        <div style="margin: 32px 0; padding: 20px; border: 1px solid #edf2f7; border-radius: 12px;">
                            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #BF1737;">Détails de livraison</h3>
                            <p style="margin: 4px 0; font-size: 14px;"><strong>Téléphone:</strong> ${order.phone || 'N/A'}</p>
                            <p style="margin: 4px 0; font-size: 14px;"><strong>Adresse:</strong> ${order.address || 'N/A'}</p>
                            <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${orderDate}</p>
                        </div>

                        <h3>Articles commandés</h3>
                        <table class="table">
                            <thead>
                                <tr style="background: #f7fafc;">
                                    <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #718096;">Description</th>
                                    <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #718096;">Qté</th>
                                    <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #718096;">Prix</th>
                                    <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #718096;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <div class="total-box">
                            <span style="font-size: 12px; text-transform: uppercase; color: #BF1737; font-weight: bold;">Montant Total TTC</span>
                            <h2 style="margin: 4px 0; font-size: 28px; font-weight: 900; color: #1a202c;">${Number(order.totalPrice).toFixed(2)} MAD</h2>
                        </div>

                        <div style="margin-top: 40px; text-align: center;">
                            <a href="http://localhost:3000/invoice?orderId=${order.id}" style="display: inline-block; padding: 16px 32px; background: #BF1737; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Voir la facture complète</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Merci pour votre confiance.</p>
                        <p>© ${new Date().getFullYear()} Droguerie Maroc - Casablanca</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const senderEmail = this.configService.get<string>('SMTP_USER');

            await this.transporter.sendMail({
                from: `"Droguerie Maroc" <${senderEmail}>`,
                to: order.email,
                subject: `Facture de votre commande #${order.id}`,
                html: htmlContent,
            });

            this.logger.log(`✅ Email de facture envoyé avec succès à ${order.email} pour la commande ${order.id}`);

        } catch (error) {
            this.logger.error(`❌ Erreur lors de l'envoi de l'email pour la commande ${order.id}:`, error.message);
        }
    }

    /**
     * Broadcasts a new content notification (Article or Tip) to all newsletter subscribers.
     * @param recipients Array of decrypted subscriber emails
     * @param content Data about the new article or tip
     */
    async sendNewsletterNotification(recipients: string[], content: { title: string; excerpt: string; type: 'ARTICLE' | 'TIP'; slug?: string }) {
        if (!recipients.length || !this.transporter) return;

        const senderEmail = this.configService.get<string>('SMTP_USER');
        const baseUrl = 'http://localhost:3000'; // Should be in env
        const link = content.type === 'ARTICLE'
            ? `${baseUrl}/blog/post/${content.slug}`
            : `${baseUrl}/blog`; // Tips show on the listing page

        const subject = content.type === 'ARTICLE'
            ? `🆕 Nouvel Article : ${content.title}`
            : `💡 Astuce du Moment : ${content.title}`;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 0; background-color: #f7fafc; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                    .header { background: #0D0D0D; padding: 50px 20px; text-align: center; color: #ffffff; }
                    .content { padding: 40px; text-align: center; }
                    .footer { background: #f7fafc; padding: 25px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
                    .badge { display: inline-block; padding: 4px 12px; background: #BF1737; color: #ffffff; border-radius: 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
                    h2 { margin: 0; font-size: 28px; font-weight: 900; color: #1a202c; line-height: 1.2; text-transform: uppercase; font-style: italic; }
                    .excerpt { margin: 24px 0 32px; color: #718096; font-size: 16px; line-height: 1.6; }
                    .button { display: inline-block; padding: 18px 40px; background: #BF1737; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 10px 15px -3px rgba(191, 23, 55, 0.3); }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="badge">${content.type === 'ARTICLE' ? 'NOUVEAUTÉ BLOG' : 'ASTUCE D\'EXPERT'}</div>
                        <h2>${content.title}</h2>
                    </div>
                    <div class="content">
                        <p class="excerpt">${content.excerpt}</p>
                        <a href="${link}" class="button">${content.type === 'ARTICLE' ? 'Lire l\'article Complet' : 'Découvrir l\'Astuce'}</a>
                    </div>
                    <div class="footer">
                        <p>Vous recevez cet email car vous êtes abonné à la Newsletter Pro de <strong>Droguerie Maroc</strong>.</p>
                        <p>© ${new Date().getFullYear()} Droguerie Maroc - Casablanca</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send in batches to avoid SMTP limits/blocks
        const batchSize = 10;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);

            try {
                await Promise.all(batch.map(email =>
                    this.transporter.sendMail({
                        from: `"Droguerie Maroc" <${senderEmail}>`,
                        to: email,
                        subject: subject,
                        html: htmlContent,
                    })
                ));
                this.logger.log(`📢 Newsletter broadcast: Sent batch ${Math.floor(i / batchSize) + 1} (${batch.length} recipients)`);
            } catch (error) {
                this.logger.error(`❌ Newsletter broadcast failed for a batch near index ${i}:`, error.message);
            }

            // Small delay between batches if needed
            if (i + batchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    /**
     * Sends a premium notification to the administrator with the order PDF attached.
     */
    async sendAdminOrderNotification(order: Order, pdfBuffer: Buffer) {
        if (!this.transporter) {
            this.logger.error('Mailing system not initialized. Could not send admin notification.');
            return;
        }

        const adminEmail = this.configService.get<string>('SMTP_ADMIN_EMAIL') || 'admin@drogueriemaroc.com';
        const senderEmail = this.configService.get<string>('SMTP_USER');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; line-height: 1.6; background: #f7fafc; padding: 40px; }
                    .card { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                    .header { color: #BF1737; font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 24px; }
                    .info { margin-bottom: 32px; padding: 20px; background: #fdf2f2; border-radius: 16px; }
                    .button { display: inline-block; padding: 14px 28px; background: #BF1737; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">🚨 Nouvelle Commande Reçue</div>
                    <div class="info">
                        <p style="margin: 0; font-weight: bold;">Référence: ${order.invoiceReference || 'ORD-' + order.id}</p>
                        <p style="margin: 4px 0;">Client: ${order.customerName}</p>
                        <p style="margin: 0; color: #BF1737; font-weight: 900; font-size: 24px;">${Number(order.totalPrice).toFixed(2)} MAD</p>
                    </div>
                    <p>Un rapport détaillé au format PDF a été généré et joint à cet e-mail pour votre gestion administrative.</p>
                    <div style="margin-top: 32px; text-align: center;">
                        <a href="http://localhost:3000/admin/orders" class="button">Gérer dans le Tableau de Bord</a>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await this.transporter.sendMail({
                from: `"Système MOL" <${senderEmail}>`,
                to: adminEmail,
                subject: `🔔 NOUVELLE COMMANDE : ${order.customerName} - ${order.invoiceReference || order.id}`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `COMMANDE_${order.invoiceReference || order.id}.pdf`,
                        content: pdfBuffer,
                    }
                ]
            });
            this.logger.log(`✅ Notification Admin envoyée pour la commande ${order.id}`);
        } catch (error) {
            this.logger.error(`❌ Échec de la notification Admin pour la commande ${order.id}:`, error.message);
        }
    }
}
