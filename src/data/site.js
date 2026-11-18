// Store-wide settings. Change these before launch.
export const SITE = {
  name: 'Herre&Dame',
  // Live address. Change to 'https://herredame.com' once that domain is bought and connected.
  url: (typeof process !== 'undefined' && process.env && process.env.SITE_URL) || 'https://new.herredame-contact.workers.dev',
  tagline: 'The polo, perfected. For him and for her.',
  description:
    'Herre&Dame makes piqué polos, hoodies, sweatshirts and tees for him and for her. Couple sets, honest prices and cash on delivery across Pakistan.',
  // TODO: WhatsApp business number in international format, digits only (e.g. 923001234567).
  whatsapp: '923451860326',
  email: 'hello@herredame.com',
  instagram: 'https://www.instagram.com/herredame/',
  currency: 'PKR',
  country: 'PK',
};

export const SHIPPING = {
  // Orders at or above this subtotal ship free (after discounts).
  freeThreshold: 2990,
  // Flat delivery fee below the threshold.
  fee: 250,
  deliveryDays: '2 to 4 working days',
  exchangeDays: 7,
};
