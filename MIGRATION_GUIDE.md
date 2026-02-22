# Database Migration Guide: Separate EBOM and MBOM Tables

## Overview
The system has been updated to use separate tables for storing EBOM (Engineering Bill of Materials) and MBOM (Manufacturing Bill of Materials) instead of a unified table with a type column.

## Database Changes

### Old Structure:
- `boms` table (with `type` column: 'ebom' or 'mbom')
- `bom_items` table (with all fields for both types)

### New Structure:
- `eboms` table (Engineering BOM metadata)
- `ebom_items` table (EBOM line items with fields: level, partNumber, partName, partDescription, quantity, uom)
- `mboms` table (Manufacturing BOM metadata)
- `mbom_items` table (MBOM line items with fields: level, partNumber, partName, quantity, workstationNo, workstationName, operation, operationTime)

## Migration Steps

### 1. Run Database Migration
Execute the migration SQL file to create the new table structure:

```bash
cd backend
psql -U your_username -d your_database -f migrate-to-columns.sql
```

Or if using Docker/connection string:
```bash
psql "your_connection_string" -f migrate-to-columns.sql
```

### 2. Restart Backend Server
The backend has been updated with new models and routes:
```bash
cd backend
npm run dev
```

### 3. Clear Frontend Cache (if needed)
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

## API Route Changes

### Old Routes:
- `POST /api/bom/save` - Save any BOM
- `GET /api/bom` - Get all BOMs
- `GET /api/bom/:id` - Get BOM by ID
- `DELETE /api/bom/:id` - Delete BOM
- `GET /api/bom/:id/formatted` - Get formatted BOM

### New Routes:
- `POST /api/bom/save` - Save EBOM or MBOM (type specified in body)
- `GET /api/bom` - Get all BOMs (optional `?type=ebom` or `?type=mbom` filter)
- `GET /api/bom/:type/:id` - Get BOM by type and ID
- `DELETE /api/bom/:type/:id` - Delete BOM by type and ID
- `GET /api/bom/:type/:id/formatted` - Get formatted BOM

## Model Files

### New Models:
- `backend/models/Ebom.js` - EBOM model
- `backend/models/EbomItem.js` - EBOM item model
- `backend/models/Mbom.js` - MBOM model
- `backend/models/MbomItem.js` - MBOM item model

### Old Models (can be removed after migration):
- `backend/models/Bom.js` 
- `backend/models/BomItem.js`

## Benefits of Separate Tables

1. **Better Data Integrity**: Each table only contains fields relevant to its BOM type
2. **Clearer Schema**: No nullable fields that only apply to one type
3. **Improved Performance**: Smaller tables and more targeted queries
4. **Easier Maintenance**: Type-specific validations and constraints
5. **Scalability**: Easier to extend with type-specific features

## Frontend Changes

The frontend API client (`frontend/src/utils/api.js`) has been updated to:
- Pass `type` parameter to `getById()` and `delete()` methods
- Support optional type filtering in `getAll()` method

Components updated:
- `SavedBomsModal.jsx` - Now passes type when viewing/deleting BOMs
- `ProductionLineView.jsx` - Accepts `bomType` prop for API calls

## Notes

- The migration script drops old tables, so backup any important data first
- All existing BOMs will be lost during migration (fresh start with new schema)
- The conversion endpoint (`POST /api/bom/convert`) remains unchanged
- Both EBOM and MBOM can still be generated from the same CSV input
