# Database Migration Instructions

## Customer-Specific Coupon Feature

### Changes Made:
1. Added `specificUserId` field to Coupon model (optional)
2. Added relation between User and Coupon for customer-specific coupons
3. Added index on `specificUserId` for better query performance

### To Apply Migration:

1. Navigate to backend directory:
```bash
cd backend
```

2. Generate and apply migration:
```bash
npx prisma migrate dev --name add-customer-specific-coupons
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

### Verification:
After migration, verify the changes:
```bash
npx prisma studio
```

Check that the Coupon table has the new `specificUserId` column.

### Rollback (if needed):
If you need to rollback, you can manually remove the migration file and reset:
```bash
npx prisma migrate reset
```
