# Database Migration - Add Invoice, Package Slip URLs and Courier Tracking to Orders

## Changes Made
Added five optional fields to the Order model:
- `invoiceUrl` (String, optional) - Stores the URL of uploaded invoice
- `packageSlipUrl` (String, optional) - Stores the URL of uploaded package slip
- `courierName` (String, optional) - Stores the courier service name
- `trackingId` (String, optional) - Stores the shipment tracking ID
- `trackingLink` (String, optional) - Stores the tracking URL

## Migration Steps

1. Navigate to the backend directory:
```bash
cd backend
```

2. Generate the Prisma migration:
```bash
npx prisma migrate dev --name add_order_documents_and_tracking
```

3. Apply the migration:
```bash
npx prisma generate
```

## Verification
After migration, verify the changes:
```bash
npx prisma studio
```

Check that the Order table now has `invoiceUrl`, `packageSlipUrl`, `courierName`, `trackingId`, and `trackingLink` columns.
