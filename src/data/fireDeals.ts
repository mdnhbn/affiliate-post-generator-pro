export interface FireDealProduct {
  id: string;
  title: string;
  category: string;
  priceDiscount: string;
  estCommission?: string;
  features: string;
  asin?: string;
  amazonUrl: string;
  imageUrl?: string;
  badge: string;
  discountPercent?: number;
  addedDate?: string;
}

export const AMAZON_FIRE_DEALS: FireDealProduct[] = [
  {
    id: 'fire-1',
    title: 'Anker Soundcore 2 Portable Bluetooth Speaker with 12W Stereo Sound',
    category: 'Tech & Electronics',
    priceDiscount: '$29.99 — 33% OFF',
    estCommission: '8% ($2.40 / sale)',
    features: 'Unbelievable sound with dual neodymium drivers, IPX7 waterproof protection, 24-hour battery life (500 songs), Bluetooth 5.0 fast connection.',
    asin: 'B01MTB55WH',
    amazonUrl: 'https://www.amazon.com/dp/B01MTB55WH',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    badge: '🏆 #1 BEST SELLER',
    discountPercent: 33,
    addedDate: 'July 28, 2026',
  },
  {
    id: 'fire-2',
    title: 'Ring Video Doorbell (1080p HD Video, Enhanced Motion Detection)',
    category: 'Smart Home',
    priceDiscount: '$59.99 — 40% OFF',
    estCommission: '10% ($6.00 / sale)',
    features: '1080p HD video with night vision, crisp two-way talk, real-time mobile notifications, built-in rechargeable battery or wire to existing doorbell.',
    asin: 'B08N5WRWNW',
    amazonUrl: 'https://www.amazon.com/dp/B08N5WRWNW',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
    badge: '⚡ 50%+ OFF',
    discountPercent: 40,
    addedDate: 'July 29, 2026',
  },
  {
    id: 'fire-3',
    title: 'Stanley Quencher H2.0 FlowState Stainless Steel Vacuum Insulated Tumbler 40oz',
    category: 'Kitchen & Dining',
    priceDiscount: '$45.00 — Viral Pick',
    estCommission: '9% ($4.05 / sale)',
    features: 'Keeps drinks cold for 11 hours and iced for 2 days. Ergonomic comfort grip handle, reusable straw, fits standard car cup holders, BPA-free.',
    asin: 'B0BL4RWX8D',
    amazonUrl: 'https://www.amazon.com/dp/B0BL4RWX8D',
    imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=600&auto=format&fit=crop&q=80',
    badge: '⭐ TRENDING VIRAL',
    discountPercent: 20,
    addedDate: 'July 30, 2026',
  },
  {
    id: 'fire-4',
    title: 'Theragun Mini Handheld Electric Massage Gun Deep Tissue',
    category: 'Fitness & Health',
    priceDiscount: '$149.00 — 25% OFF',
    estCommission: '8% ($11.92 / sale)',
    features: 'Compact ultra-portable percussion massager, 3 speed settings (1750, 2100, 2400 PPM), QuietForce technology motor, 150-min battery life.',
    asin: 'B087MGJ753',
    amazonUrl: 'https://www.amazon.com/dp/B087MGJ753',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    badge: '🔥 HOT DEAL',
    discountPercent: 25,
    addedDate: 'July 28, 2026',
  },
  {
    id: 'fire-5',
    title: 'COSRX Snail Mucin 96% Power Repairing Essence Serum 3.38 fl.oz',
    category: 'Beauty & Personal Care',
    priceDiscount: '$14.99 — 40% OFF',
    estCommission: '10% ($1.50 / sale)',
    features: 'Formulated with 96.3% Snail Secretion Filtrate, lightweight gel serum that hydrates skin, repairs damaged skin barrier, reduces dark spots.',
    asin: 'B00PBX3L7K',
    amazonUrl: 'https://www.amazon.com/dp/B00PBX3L7K',
    imageUrl: 'https://images.unsplash.com/photo-1608248597261-833258657b45?w=600&auto=format&fit=crop&q=80',
    badge: '🏆 #1 BEST SELLER',
    discountPercent: 40,
    addedDate: 'July 31, 2026',
  },
  {
    id: 'fire-6',
    title: 'Blink Outdoor 4 Wireless Smart Security Camera (1080p HD, 2-Yr Battery)',
    category: 'Smart Home',
    priceDiscount: '$49.99 — 50% OFF',
    estCommission: '10% ($5.00 / sale)',
    features: 'Wire-free 1080p HD security camera, up to 2-year battery life on AA lithium batteries, infrared night vision, motion detection alerts, works with Alexa.',
    asin: 'B0B1N4N7X7',
    amazonUrl: 'https://www.amazon.com/dp/B0B1N4N7X7',
    imageUrl: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=600&auto=format&fit=crop&q=80',
    badge: '⚡ 50%+ OFF',
    discountPercent: 50,
    addedDate: 'July 27, 2026',
  },
  {
    id: 'fire-7',
    title: 'Apple AirTag 4-Pack Item Tracker',
    category: 'Tech & Electronics',
    priceDiscount: '$79.99 — 19% OFF',
    estCommission: '8% ($6.40 / sale)',
    features: 'Keep track of keys, wallet, luggage, and backpack in the Find My app. One-tap setup connects AirTag with iPhone or iPad. Built-in speaker plays sound.',
    asin: 'B0932QJ2JZ',
    amazonUrl: 'https://www.amazon.com/dp/B0932QJ2JZ',
    imageUrl: 'https://images.unsplash.com/photo-1628102491629-778571d893a3?w=600&auto=format&fit=crop&q=80',
    badge: '🔥 HOT DEAL',
    discountPercent: 19,
    addedDate: 'July 26, 2026',
  },
  {
    id: 'fire-8',
    title: 'Lululemon Everywhere Belt Bag 1L Crossbody Fanny Pack',
    category: 'Fashion & Accessories',
    priceDiscount: '$38.00 — Trending',
    estCommission: '9% ($3.42 / sale)',
    features: 'Water-repellent fabric, exterior zippered pocket to secure valuables, interior pockets hold essentials, adjustable strap for shoulder or waist wear.',
    asin: 'B09TD9RXYZ',
    amazonUrl: 'https://www.amazon.com/dp/B09TD9RXYZ',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    badge: '⭐ TRENDING VIRAL',
    discountPercent: 15,
    addedDate: 'July 25, 2026',
  }
];
