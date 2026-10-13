# Tiffin Platform (Jabalpur demo)

Monorepo for a single-kitchen tiffin subscription business: **Next.js website**, **Express API**, **MongoDB**, **Flutter Android app**, and **admin dashboard** (web `/admin`).

## Structure

```
apps/api      — Node.js + Express + Mongoose (port 5000)
apps/web      — Next.js customer site + admin (port 3000)
apps/mobile   — Flutter Android client
packages/shared — Types, money (paise), IST dates, subscription math
docs/         — API, date policy, checklists
```

## Prerequisites

- Node.js 20+
- MongoDB (local `mongod` or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- Optional: Flutter SDK for Android builds

## Setup

```powershell
cd "c:\tifin project"
npm install
npm run build --workspace=@tiffin/shared
copy .env.example apps\api\.env
copy apps\web\.env.local.example apps\web\.env.local   # or use existing apps\web\.env.local
```

### MongoDB local

Ensure MongoDB service is running. Default URI: `mongodb://127.0.0.1:27017/tiffin_platform`

### Atlas

Set `MONGODB_URI` in `apps/api/.env`. Allow your IP in Atlas Network Access.

### Seed (non-destructive)

```powershell
npm run seed
```

Creates demo admin, business settings, sample plans/add-ons if missing.

**Admin login (after seed):**

- Phone: `9999999999`
- Password: `ChangeMeAdmin123!`
- Email: `admin@demo.local`

## Run locally

```powershell
npm run dev
```

- Website: http://localhost:3000  
- API health: http://localhost:5000/api/health  

Or separately: `npm run dev:api` / `npm run dev:web`

## Tests

```powershell
npm run test --workspace=@tiffin/shared
npm run test --workspace=@tiffin/api
npm run build
```

## Android app

```powershell
cd apps\mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000
```

- **Emulator:** `10.0.2.2` maps to host `localhost`.
- **Physical device:** use your PC LAN IP, e.g. `--dart-define=API_BASE_URL=http://192.168.1.5:5000`

Flutter was not detected in PATH on the initial build machine — install Flutter and Android SDK to build the APK.

## Free vs paid features

| Feature | Local free |
|---------|------------|
| Auth (password + dev OTP) | Yes |
| Mock payments (DEMO) | Yes |
| In-app notifications (dev log) | Yes |
| Razorpay live payments | Needs credentials |
| SMS OTP | Needs SMS provider |
| Hosting | Your choice |

## Documentation

- [API](docs/API.md)
- [Date policy](docs/DATE_POLICY.md)
- [Security checklist](docs/SECURITY_CHECKLIST.md)
- [Production checklist](docs/PRODUCTION_CHECKLIST.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Completed vs roadmap

**Implemented:** Auth, RBAC, plans from DB, subscription quotes/start dates, mock payments with idempotency, holidays, add-on orders, admin dashboard stats, kitchen list, seed script, integration tests, core customer + admin web flows, Flutter login/plans skeleton.

**Extend next:** Full Razorpay webhooks, all admin CRUD pages in web UI, every mobile screen parity, E2E Playwright, delivery staff assignment UI, CSV export buttons, Hindi i18n.
