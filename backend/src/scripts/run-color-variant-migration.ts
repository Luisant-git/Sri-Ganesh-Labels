import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateColorVariantId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function runMigration() {
  try {
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      const colors = product.colors as any[];
      const updatedColors = colors.map(color => ({
        ...color,
        colorVariantId: color.colorVariantId || generateColorVariantId()
      }));
      
      await prisma.product.update({
        where: { id: product.id },
        data: { colors: updatedColors as any }
      });
    }
    
    console.log(`✅ Migration completed successfully!`);
    console.log(`Updated ${products.length} products with colorVariantId`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
