export const categories = [
  {
    "name": "Bar code Label",
    "slug": "bar-code-label",
    "image": "/web/Barcode Labels.webp",
    "count": 33
  },
  {
    "name": "DT materials",
    "slug": "dt-materials",
    "image": "/web/p_IMG_20260818_171935.jpg",
    "count": 15
  },
  {
    "name": "Thermal Roll",
    "slug": "thermal-roll",
    "image": "/web/thermal rolls.webp",
    "count": 3
  },
  {
    "name": "Wax-Resin Ribbons",
    "slug": "wax-resin-ribbons",
    "image": "/web/p_IMG_20260818_172141.jpg",
    "count": 3
  }
];

export const products = [
  {
    "id": 1,
    "name": "Bar code Label 40 x 25 mm",
    "category": "Bar code Label",
    "image": "/web/Barcode Labels.webp",
    "gallery": [
      "/web/Barcode Labels.webp"
    ],
    "price": 199,
    "originalPrice": 249,
    "discount": 20,
    "rating": 4.8,
    "reviews": 128,
    "description": "High-quality thermal barcode labels with strong permanent adhesive. Crisp, scannable print, smudge resistant and made to last.",
    "options": [],
    "stock": 500,
    "featured": true,
    "badge": "Best Seller",
    "isNew": false
  },
  {
    "id": 2,
    "name": "Bar code Label 100 x 50 mm",
    "category": "Bar code Label",
    "image": "/web/Barcode Labels.webp",
    "gallery": [
      "/web/Barcode Labels.webp"
    ],
    "price": 299,
    "originalPrice": 379,
    "discount": 21,
    "rating": 4.7,
    "reviews": 94,
    "description": "Large-format thermal barcode labels with strong permanent adhesive. Crisp, scannable print, smudge resistant and made to last.",
    "options": [],
    "stock": 500,
    "featured": true,
    "badge": "Popular",
    "isNew": false
  },
  {
    "id": 3,
    "name": "DT materials 4 inch x 6 inch",
    "category": "DT materials",
    "image": "/web/p_IMG_20260818_171935.jpg",
    "gallery": [
      "/web/p_IMG_20260818_171935.jpg"
    ],
    "price": 449,
    "originalPrice": 559,
    "discount": 20,
    "rating": 4.6,
    "reviews": 76,
    "description": "Direct thermal label materials for fast, reliable printing without ribbons. Great for shipping, retail and warehouse use.",
    "options": [],
    "stock": 500,
    "featured": true,
    "badge": "Popular",
    "isNew": true
  },
  {
    "id": 4,
    "name": "DT materials 2 inch x 2 inch",
    "category": "DT materials",
    "image": "/web/p_IMG_20260818_171935.jpg",
    "gallery": [
      "/web/p_IMG_20260818_171935.jpg"
    ],
    "price": 199,
    "originalPrice": 249,
    "discount": 20,
    "rating": 4.5,
    "reviews": 58,
    "description": "Compact direct thermal labels for price tags and small item labelling. Fast printing with crisp, durable output.",
    "options": [],
    "stock": 500,
    "featured": false,
    "badge": "",
    "isNew": false
  },
  {
    "id": 5,
    "name": "Thermal Roll 57 mm x 40 m",
    "category": "Thermal Roll",
    "image": "/web/thermal rolls.webp",
    "gallery": [
      "/web/thermal rolls.webp"
    ],
    "price": 399,
    "originalPrice": 499,
    "discount": 20,
    "rating": 4.7,
    "reviews": 64,
    "description": "High-speed thermal transfer rolls with excellent heat and moisture resistance. Clean, consistent output every time.",
    "options": [],
    "stock": 600,
    "featured": true,
    "badge": "Best Seller",
    "isNew": false
  },
  {
    "id": 6,
    "name": "Wax-Resin Ribbons 80 mm x 300 m",
    "category": "Wax-Resin Ribbons",
    "image": "/web/p_IMG_20260818_172141.jpg",
    "gallery": [
      "/web/p_IMG_20260818_172141.jpg"
    ],
    "price": 450,
    "originalPrice": 560,
    "discount": 20,
    "rating": 4.8,
    "reviews": 41,
    "description": "Wax-resin thermal transfer ribbons for durable, smudge-proof prints on labels and tags. Ideal for barcode printers.",
    "options": [],
    "stock": 400,
    "featured": true,
    "badge": "Premium",
    "isNew": true
  }
];

export const sortOptions = [
  {
    "value": "popular",
    "label": "Popular"
  },
  {
    "value": "price-asc",
    "label": "Price: Low to High"
  },
  {
    "value": "price-desc",
    "label": "Price: High to Low"
  },
  {
    "value": "newest",
    "label": "Newest"
  },
  {
    "value": "rating",
    "label": "Rating"
  }
];

export function getProductById(id) {
  return products.find((p) => String(p.id) === String(id))
}

export function getRelatedProducts(product, limit = 4) {
  const same = products.filter((p) => p.id !== product.id && p.category === product.category)
  const others = products.filter((p) => p.id !== product.id && p.category !== product.category)
  return [...same, ...others].slice(0, limit)
}

export const bestsellers = products.filter((p) => p.featured).slice(0, 8)
