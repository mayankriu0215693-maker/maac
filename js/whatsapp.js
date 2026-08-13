export function generateWhatsAppLink(application) {
    const phone = "919693125648";
    const text = `Hello Maa Enterprises,\n\nI have submitted an online application.\n\n*Acknowledgement Number:* ${application.acknowledgementNumber}\n*Service:* ${application.serviceName}\n*Name:* ${application.customerName}\n*Mobile:* ${application.mobile}\n\nI am attaching my required documents and payment screenshot.\n\nThank you.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function getStatusBadgeClass(status) {
    if (!status) return 'badge-default';
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'badge-pending';
    if (s.includes('process')) return 'badge-processing';
    if (s.includes('complet') || s.includes('verif')) return 'badge-completed';
    if (s.includes('reject')) return 'badge-rejected';
    return 'badge-default';
}

export function escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
