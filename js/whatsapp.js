export function generateWhatsAppLink(application) {
    const phone = "919693125648";
    const text = `Hello Maa Enterprises,\n\nI have submitted an application.\n\nAcknowledgement Number: ${application.acknowledgementNumber}\nService: ${application.serviceName}\nName: ${application.customerName}\nMobile: ${application.mobile}\n\nI have attached my required documents and payment screenshot.\n\nThank you.`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
