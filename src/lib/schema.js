// JSON-LD builders (schema.org) for Google rich results.
import { SITE, SHIPPING } from '../data/site.js';
import { priceOf, productUrl, imagesFor, categoryById, bundlePrice, bundleUrl, BUNDLE_IMAGES } from '../data/catalog.js';

const abs = (p) => new URL(p, SITE.url).href;
const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': abs('/#org'),
    name: SITE.name,
    url: abs('/'),
    logo: abs('/favicon.svg'),
    sameAs: [SITE.instagram],
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: SITE.email, areaServed: 'PK', availableLanguage: ['en', 'ur'] },
  };
}

export function website() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#website'), name: SITE.name, url: abs('/'), publisher: { '@id': abs('/#org') } };
}

export function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, ...(it.href ? { item: abs(it.href) } : {}) })),
  };
}

const shippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: SHIPPING.fee, currency: 'PKR' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
  },
};

const returnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'PK',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: SHIPPING.exchangeDays,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
};

function offer(url, price) {
  return {
    '@type': 'Offer',
    url,
    priceCurrency: 'PKR',
    price,
    priceValidUntil,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': abs('/#org') },
    shippingDetails,
    hasMerchantReturnPolicy: returnPolicy,
  };
}

const audience = (gender) =>
  gender === 'men' ? { '@type': 'PeopleAudience', suggestedGender: 'male' }
  : gender === 'women' ? { '@type': 'PeopleAudience', suggestedGender: 'female' }
  : { '@type': 'PeopleAudience', suggestedGender: 'unisex' };

/** ProductGroup with one Product per colour x size, as Google recommends for variants. */
export function productGroup(product) {
  const cat = categoryById[product.category];
  const price = priceOf(product.id);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': abs(`/products/${product.id}/#group`),
    name: product.name,
    description: product.short,
    brand: { '@type': 'Brand', name: SITE.name },
    productGroupID: product.id,
    variesBy: ['https://schema.org/color', 'https://schema.org/size'],
    audience: audience(cat.gender),
    category: cat.h1,
    hasVariant: product.colors.flatMap((c) => {
      const url = abs(productUrl(product.id, c.id));
      const img = imagesFor(c.folder).images[0];
      return product.sizes.map((size) => ({
        '@type': 'Product',
        sku: `${product.id}-${c.id}-${size}`.toUpperCase(),
        name: `${product.name} - ${c.name} - ${size}`,
        color: c.name,
        size,
        url,
        image: img ? abs(`${img.src}-1200.jpg`) : undefined,
        offers: offer(url, price),
      }));
    }),
  };
}

export function bundleProduct(bundle) {
  const { price } = bundlePrice(bundle);
  const img = BUNDLE_IMAGES[bundle.image];
  const url = abs(bundleUrl(bundle.id));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.name,
    description: bundle.short,
    sku: bundle.id.toUpperCase(),
    brand: { '@type': 'Brand', name: SITE.name },
    image: img ? abs(`${img.src}-1200.jpg`) : undefined,
    url,
    offers: offer(url, price),
  };
}

export function itemList(urls) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: urls.map((u, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(u) })),
  };
}
