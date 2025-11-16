# Authentication Demo

## Demo Credentials

- **Admin**: `admin@example.com` / `AdminPass123!`
- **User**: `user@example.com` / `UserPass123!`

## Seeder Instructions

Users are automatically seeded when the server starts in development mode (`NODE_ENV=development`). To manually seed:

```bash
cd server
ts-node src/seeders/user.seeder.ts
```

The seeder is idempotent and will skip users that already exist.

## API Examples

### 1) Login

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123!"}'
```

### 2) Create Item with Token

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"AdminPass123!"}' | jq -r '.token')

curl -X POST http://localhost:4000/api/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemName":"Test","quantity":1,"price":9.99,"description":"demo","category":"tools"}'
```

## Notes

- Uses localStorage for demo token storage; use httpOnly cookie in production.
- JWT tokens expire after 7 days.
- Write operations (POST/PUT/DELETE) require authentication.

