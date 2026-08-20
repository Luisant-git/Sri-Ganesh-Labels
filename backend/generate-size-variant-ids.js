const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSizeVariantId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateSizeVariantIds() {
  try {
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      if (!product.colors || product.colors.length === 0) continue;
      
      const updatedColors = product.colors.map(color => {
        if (!color.sizes || color.sizes.length === 0) return color;
        
        const updatedSizes = color.sizes.map(size => ({
          ...size,
          sizeVariantId: generateSizeVariantId() // Always generate new ID
        }));
        
        return { ...color, sizes: updatedSizes };
      });
      
      await prisma.product.update({
        where: { id: product.id },
        data: { colors: updatedColors }
      });
      
      console.log(`✓ Updated product ${product.id}: ${product.name} (${updatedColors.reduce((sum, c) => sum + (c.sizes?.length || 0), 0)} variants)`);
    }
    
    console.log('\n✅ All products updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateSizeVariantIds();
