const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
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

const products = [
  {
    "name": "Bar code Label sticker 100 x 50",
    "category": "Bar code Label",
    "image": "/web/p_IMG_20260818_171554.jpg",
    "gallery": [
      "/web/p_IMG_20260818_171554.jpg",
      "/web/p_IMG_20260818_171721.jpg"
    ],
    "price": 199,
    "originalPrice": 249,
    "gstPercentage": 18,
    "description": "1000 labels",
    "stock": 500
  },
  {
    "name": "Bar code Label sticker 20 x 20",
    "category": "Bar code Label",
    "image": "/web/p_IMG_20260818_171822.jpg",
    "gallery": [
      "/web/p_IMG_20260818_171822.jpg",
      "/web/p_IMG_20260818_171811.jpg"
    ],
    "price": 299,
    "originalPrice": 379,
    "gstPercentage": 18,
    "description": "5000 labels",
    "stock": 500
  },
  {
    "name": "Bar code Label sticker 25 x 25",
    "category": "Bar code Label",
    "image": "/web/p_IMG_20260818_171943.jpg",
    "gallery": [
      "/web/p_IMG_20260818_171943.jpg",
      "/web/p_IMG_20260818_171935.jpg"
    ],
    "price": 449,
    "originalPrice": 559,
    "gstPercentage": 18,
    "description": "5000 labels",
    "stock": 500
  },
  {
    "name": "Bar code Label sticker 25 x 15",
    "category": "Bar code Label",
    "image": "/web/p_IMG_20260818_172141.jpg",
    "gallery": [
      "/web/p_IMG_20260818_172141.jpg",
      "/web/p_IMG_20260818_172126.jpg"
    ],
    "price": 199,
    "originalPrice": 249,
    "gstPercentage": 18,
    "description": "5000 labels",
    "stock": 500
  },
  {
    "name": "Bar code Label sticker 35 x 22",
    "category": "Bar code Label",
    "image": "/web/p_IMG_20260818_172241.jpg",
    "gallery": [
      "/web/p_IMG_20260818_172241.jpg",
      "/web/p_IMG_20260818_172231.jpg"
    ],
    "price": 399,
    "originalPrice": 499,
    "gstPercentage": 18,
    "description": "5000 labels",
    "stock": 600
  },
  {
    "name": "Bar code Label sticker 50 x 35",
    "category": "Bar code Label",
    "image": "/web/p_IMG_20260818_172352.jpg",
    "gallery": [
      "/web/p_IMG_20260818_172352.jpg",
      "/web/p_IMG_20260818_172332.jpg"
    ],
    "price": 450,
    "originalPrice": 560,
    "gstPercentage": 18,
    "description": "2500 labels",
    "stock": 400
  }
];

async function seed() {
  try {
    console.log('Seeding categories...');
    const categoryIds = {};
    for (const category of categories) {
      const upserted = await prisma.category.upsert({
        where: { name: category.name },
        update: { image: category.image },
        create: {
          name: category.name,
          image: category.image,
        },
      });
      categoryIds[category.name] = upserted.id;
      console.log(`✓ Category: ${category.name} (id: ${upserted.id})`);
    }

    console.log('\nSeeding products...');
    for (const product of products) {
      const categoryId = categoryIds[product.category];
      if (!categoryId) {
        console.log(`✗ Skipped "${product.name}" - unknown category "${product.category}"`);
        continue;
      }

      const galleryUrls = [product.image, ...(product.gallery || [])].filter(
        (url, index, self) => url && self.indexOf(url) === index
      );
      const gallery = galleryUrls.map((url) => ({ url }));

      const existing = await prisma.product.findFirst({ where: { name: product.name } });
      const data = {
        name: product.name,
        description: product.description,
        categoryId,
        basePrice: String(product.price),
        mrp: product.originalPrice != null ? String(product.originalPrice) : null,
        gstPercentage: product.gstPercentage || 18,
        gallery,
        status: 'active',
        newArrivals: false,
        discount: false,
      };
      const upserted = existing
        ? await prisma.product.update({ where: { id: existing.id }, data })
        : await prisma.product.create({ data });
      console.log(`✓ Product: ${product.name} (id: ${upserted.id})`);
    }

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();