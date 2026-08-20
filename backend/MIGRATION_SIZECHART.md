# Size Chart Migration to SubCategory

## Database Migration Steps

1. Run Prisma migration to add sizeChart field to SubCategory:
```bash
cd backend
npx prisma migrate dev --name add_sizechart_to_subcategory
```

2. Generate Prisma Client:
```bash
npx prisma generate
```

3. Restart the backend server

## Changes Made

### Backend:
- Added `sizeChart` optional field to SubCategory model in schema.prisma
- Updated CreateSubCategoryDto to include sizeChart field
- UpdateSubCategoryDto automatically includes it via PartialType

### Admin Panel:
- Added size chart upload in AddSubCategory page
- Added size chart upload in SubCategoryList edit modal
- Size chart is optional field

### Frontend:
- Size chart will be fetched from subcategory data
- Products will show size chart based on their subcategory

## Notes:
- Old SizeChart model can be removed after migration
- Size chart is now per subcategory instead of global
- All products under a subcategory will share the same size chart
