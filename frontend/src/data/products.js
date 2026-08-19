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
    "name": "Bar code Label sticker 100 x 50",
    "category": "Bar code Label",
    "image": "/web/p_IMG_20260818_171554.jpg",
    "gallery": [
      "/web/p_IMG_20260818_171554.jpg",
      "/web/p_IMG_20260818_171721.jpg"
    ],
    "price": 199,
    "originalPrice": 249,
    "rate": 100,
    "gstPercentage": 18,
    "gstAmount": 18,
    "totalValue": 118,
    "description": "1000 labels",
    "options": [],
    "stock": 500
  },
  {
    "id": 2,
    "name": "Bar code Label sticker 20 x 20",
    "category": "Bar code Label",
    "image": "/web/p_IMG_20260818_171822.jpg",
    "gallery": [
      "/web/p_IMG_20260818_171822.jpg",
      "/web/p_IMG_20260818_171811.jpg"
    ],
    "price": 299,
    "originalPrice": 379,
    "rate": 150,
    "gstPercentage": 18,
    "gstAmount": 27,
    "totalValue": 177,
    "description": "5000 labels",
    "options": [],
    "stock": 500
  },

{
  "id": 3,
  "name": "Bar code Label sticker 25 x 25",
  "category": "Bar code Label",
  "image": "/web/p_IMG_20260818_171943.jpg",
  "gallery": [
    "/web/p_IMG_20260818_171943.jpg",
    "/web/p_IMG_20260818_171935.jpg"
  ],
  "price": 449,
  "originalPrice": 559,
  "rate": 172,
  "gstPercentage": 18,
  "gstAmount": 30.96,
  "totalValue": 202.96,
  "description": "5000 labels",
  "options": [],
  "stock": 500
},


 {
  "id": 4,
  "name": "Bar code Label sticker 25 x 15",
  "category": "Bar code Label",
  "image": "/web/p_IMG_20260818_172141.jpg",
  "gallery": [
    "/web/p_IMG_20260818_172141.jpg",
    "/web/p_IMG_20260818_172126.jpg"
  ],
  "price": 199,
  "originalPrice": 249,
  "rate": 125,
  "gstPercentage": 18,
  "gstAmount": 22.50,
  "totalValue": 147.50,
  "description": "5000 labels",
  "options": [],
  "stock": 500
},
{
  "id": 5,
  "name": "Bar code Label sticker 35 x 22",
  "category": "Bar code Label",
  "image": "/web/p_IMG_20260818_172241.jpg",
  "gallery": [
    "/web/p_IMG_20260818_172241.jpg",
    "/web/p_IMG_20260818_172231.jpg"
  ],
  "price": 399,
  "originalPrice": 499,
  "rate": 209,
  "gstPercentage": 18,
  "gstAmount": 37.62,
  "totalValue": 246.62,
  "description": "5000 labels",
  "options": [],
  "stock": 600
},
{
  "id": 6,
  "name": "Bar code Label sticker 50 x 35",
  "category": "Bar code Label",
  "image": "/web/p_IMG_20260818_172352.jpg",
  "gallery": [
    "/web/p_IMG_20260818_172352.jpg",
    "/web/p_IMG_20260818_172332.jpg"
  ],
  "price": 450,
  "originalPrice": 560,
  "rate": 230,
  "gstPercentage": 18,
  "gstAmount": 41.40,
  "totalValue": 271.40,
  "description": "2500 labels",
  "options": [],
  "stock": 400
},
];

export const sortOptions = [
  {
    "value": "price-asc",
    "label": "Price: Low to High"
  },
  {
    "value": "price-desc",
    "label": "Price: High to Low"
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

export const bestsellers = products.slice(0, 8)
