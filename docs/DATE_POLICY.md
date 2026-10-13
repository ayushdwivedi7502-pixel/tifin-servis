# Date calculation policy

- All subscription **calendar dates** (`startDate`, `endDate`, meal schedule `date` fields) are stored as **`YYYY-MM-DD` strings** representing the calendar day in **Asia/Kolkata (IST)**.
- Server timestamps (`createdAt`, `updatedAt`) use MongoDB UTC dates.
- Customer-facing UI should format instants with `Asia/Kolkata`.
- Duration: monthly = 30 calendar days inclusive from start; weekly = 7 days; annual = 365 days; custom uses `durationDays`.
- Weekday-only delivery skips Sundays (IST weekday).
- Holidays mark meals as `holiday`; extension adds meals at end when `pausedDaysExtendSubscription` is enabled in business settings.
