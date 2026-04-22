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

const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

/**
 * Sanitizes a phone number for use in a wa.me link.
 * Removes all non-digit characters.
 * If number starts with '00', replaces with empty string (country code should be handled outside or via 212).
 * For Morocco: if it starts with '06' or '07', we assume it needs the 212 prefix if not present.
 */
function sanitizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digits (including + and spaces)
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 06 or 07 and has 10 digits, it's likely a Moroccan number without country code
    if (cleaned.length === 10 && (cleaned.startsWith('06') || cleaned.startsWith('07'))) {
        cleaned = '212' + cleaned.substring(1);
    }
    
    // If it starts with 00, remove it
    if (cleaned.startsWith('00')) {
        cleaned = cleaned.substring(2);
    }
    
    return cleaned;
}

export function generateWhatsAppLink(order: OrderDetails, customNumber?: string): string {
    const header = "🛒 *NOUVELLE COMMANDE - DROGUERIEAPP*\n\n";

    const itemsList = order.items
        .map(item => `• *${item.name}*\n  Quantité: ${item.quantity}\n  Prix: ${Number(item.price).toFixed(2)} MAD`)
        .join("\n\n");

    const footer = `\n\n💰 *TOTAL: ${Number(order.totalPrice).toFixed(2)} MAD*`;

    let customerSection = "";
    if (order.customerInfo && (order.customerInfo.name || order.customerInfo.phone || order.customerInfo.address)) {
        customerSection = "\n\n👤 *INFOS CLIENT*:\n";
        if (order.customerInfo.name) customerSection += `Nom: ${order.customerInfo.name}\n`;
        if (order.customerInfo.phone) customerSection += `Tél: ${order.customerInfo.phone}\n`;
        if (order.customerInfo.address) customerSection += `Adresse: ${order.customerInfo.address}\n`;
    }

    const fullMessage = `${header}${itemsList}${footer}${customerSection}\n\n_Commande générée via DroguerieApp_`;

    const encodedMessage = encodeURIComponent(fullMessage);
    const finalNumber = sanitizePhoneNumber(customNumber || DEFAULT_WHATSAPP_NUMBER);
    
    return `https://wa.me/${finalNumber}?text=${encodedMessage}`;
}
