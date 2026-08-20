import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSizeVariantId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function migrateSizeVariantIds() {
  try {
    console.log('🔄 Starting migration: colorVariantId → sizeVariantId...');
    
    // Update all products
    const products = await prisma.product.findMany();
    console.log(`📦 Found ${products.length} products to update`);
    
    for (const product of products) {
      const colors = product.colors as any[];
      const updatedColors = colors.map(color => ({
        ...color,
        sizes: color.sizes?.map(size => ({
          ...size,
          sizeVariantId: size.sizeVariantId || generateSizeVariantId()
        })) || []
      }));
      
      await prisma.product.update({
        where: { id: product.id },
        data: { colors: updatedColors as any }
      });
    }
    
    console.log(`✅ Updated ${products.length} products with sizeVariantId`);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSizeVariantIds();
