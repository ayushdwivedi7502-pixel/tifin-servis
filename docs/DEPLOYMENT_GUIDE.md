# Complete Deployment Guide (Render + Vercel + MongoDB Atlas)

---

## 1. Overview (Architecture)

| Component | Technology | Recommended Host | Free Tier |
|---|---|---|---|
| **Backend API** | Node.js + Express + TypeScript (`apps/api`) | **Render.com** (Web Service) | Yes |
| **Frontend** | Next.js 15 (`apps/web`) | **Vercel** (or Render Web Service) | Yes (Vercel is fastest & recommended) |
| **Database** | MongoDB | **MongoDB Atlas** (M0 Free Cluster) | Yes (512 MB permanent free) |
| **Mobile App** | Flutter (`apps/mobile`) | Build APK via Flutter CLI | N/A |

---

## 2. Environment Variables (.env)

### A. Backend API (`apps/api/.env` on Render Environment)

On Render Dashboard -> Your Service -> **Environment**:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mongodb.net/tiffin_platform?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_super_strong_random_secret_at_least_32_chars_long
JWT_REFRESH_SECRET=another_super_strong_random_secret_32_chars_long
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PAYMENT_PROVIDER=mock
CORS_ORIGIN=https://your-frontend-domain.vercel.app
TZ=Asia/Kolkata
OTP_EXPIRES_MINUTES=10
DEV_OTP_STATIC=
SEED_ADMIN_EMAIL=ayushdwivedi7502@gmail.com
SEED_ADMIN_PASSWORD=SetAStrongPassword123!
SEED_ADMIN_PHONE=6261568086
```

*(Agar Razorpay use karna ho to `PAYMENT_PROVIDER=razorpay` aur `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` add karein)*

---

### B. Frontend (`apps/web/.env.production` on Vercel Environment)

On Vercel Dashboard -> Your Project -> **Settings** -> **Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
NEXT_PUBLIC_APP_NAME=Jabalpur Tiffin Service
```

---

## 3. Database: Free MongoDB Atlas Setup (5 Minutes)

Kyunki Render pe MongoDB directly free nahi milta, MongoDB Atlas use karte hain:
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) par account banayein (Google login kar sakte hain).
2. **Build a Database** -> **M0 Free Cluster** select karein (AWS / Mumbai ap-south-1 region best hai).
3. **Database Access** -> Ek database user banayein (username & strong password note karein).
4. **Network Access** -> **Add IP Address** -> **Allow Access from Anywhere (`0.0.0.0/0`)** select karein taaki Render backend connect ho sake.
5. **Connect** -> **Drivers (Node.js)** -> Connection string copy karein:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/tiffin_platform?retryWrites=true&w=majority`
6. Is connection string ko Render ke `MONGODB_URI` environment variable me paste karein.

---

## 4. Backend Deployment on Render.com

1. [Render.com](https://render.com) par login karein (GitHub se).
2. Click **New +** -> **Web Service**.
3. Apna GitHub repository connect karein (`Ayushdwivedi/...`).
4. Settings fill karein:
   - **Name**: `tiffin-backend-api` (ya aapki marzi ka naam)
   - **Region**: Singapore ya Frankfurt
   - **Branch**: `main`
   - **Root Directory**: *(Khali chhod dein / default)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:api`
   - **Start Command**: `npm run start:api`
   - **Instance Type**: `Free`
5. **Environment Variables** tab me upar diye gaye backend `.env` variables add karein.
6. Click **Create Web Service**.
7. Render kuch minute me build karke aapko backend URL dega (Jaise `https://tiffin-backend-api.onrender.com`).
8. Verification ke liye browser me open karein:
   `https://tiffin-backend-api.onrender.com/api/health`
   Status `healthy` dikhayi dega!

---

## 5. Frontend Deployment on Vercel (Recommended)

1. [Vercel.com](https://vercel.com) par login karein (GitHub se).
2. Click **Add New...** -> **Project**.
3. Apna GitHub repository select karein.
4. Settings me:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web` (Click Edit -> select `apps/web`)
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL` = `https://tiffin-backend-api.onrender.com` (Render ka backend URL)
     - `NEXT_PUBLIC_APP_NAME` = `Jabalpur Tiffin Service`
5. Click **Deploy**.
6. 1-2 minute me aapki website live ho jayegi (e.g. `https://tiffin-web.vercel.app`)!

---

## 6. Last Step: Cross-Connection (CORS & Admin Seed)

1. Frontend ka domain copy karein (e.g. `https://tiffin-web.vercel.app`).
2. Render Dashboard me jaakar `CORS_ORIGIN` variable me ye frontend URL daal dein aur save karein (Render auto-redeploy karega).
3. **Database Seed (Initial data & Admin user)**:
   Render Web Service ke **Shell** tab me jayein aur run karein:
   ```bash
   npm run seed --workspace=@tiffin/api
   ```
   Isse default plans, menu items aur Admin user (`ayushdwivedi7502@gmail.com`) database me create ho jayenge!
