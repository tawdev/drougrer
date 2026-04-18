/**
 * Utility to generate WhatsApp order links for DroguerieApp
 */

export interface OrderDetails {
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    totalPrice: number;
    customerInfo?: {
        name?: string;
        phone?: string;
        address?: string;
    };
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER as string;

export function generateWhatsAppLink(order: OrderDetails): string {
    const header = "🛒 *NOUVELLE COMMANDE - DROGUERIEAPP*\n\n";

    const itemsList = order.items
        .map(item => `• *${item.name}*\n  Quantité: ${item.quantity}\n  Prix: ${item.price.toFixed(2)} MAD`)
        .join("\n\n");

    const footer = `\n\n💰 *TOTAL: ${order.totalPrice.toFixed(2)} MAD*`;

    let customerSection = "";
    if (order.customerInfo && (order.customerInfo.name || order.customerInfo.phone || order.customerInfo.address)) {
        customerSection = "\n\n👤 *INFOS CLIENT*:\n";
        if (order.customerInfo.name) customerSection += `Nom: ${order.customerInfo.name}\n`;
        if (order.customerInfo.phone) customerSection += `Tél: ${order.customerInfo.phone}\n`;
        if (order.customerInfo.address) customerSection += `Adresse: ${order.customerInfo.address}\n`;
    }

    const fullMessage = `${header}${itemsList}${footer}${customerSection}\n\n_Commande générée via DroguerieApp_`;

    const encodedMessage = encodeURIComponent(fullMessage);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
