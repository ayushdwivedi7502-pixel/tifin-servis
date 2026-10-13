## API health shows database disconnected

Start MongoDB locally or fix `MONGODB_URI` in `apps/api/.env`.

## CORS errors

Set `CORS_ORIGIN=http://localhost:3000` to match the web app URL.

## OTP not received

Development uses console/log OTP. Set `DEV_OTP_STATIC=123456` or read `[DEV OTP]` in API logs.

## Android cannot reach API

Do not use `localhost` on a physical phone. Use LAN IP. On emulator use `10.0.2.2:5000`.

## Subscription start date rejected

Start date must be at least `minSubscriptionLeadDays` after today (IST). See `docs/DATE_POLICY.md`.
