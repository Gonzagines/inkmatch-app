# InkMatch Booking Flow

## Purpose
Manages the lifecycle of a tattoo booking from request to confirmation, including quote and deposit.

## Trigger
- **New Request**: Webhook from Supabase (Insert into `bookings`).
- **Quote Sent**: Webhook from Supabase (Update `bookings.status = 'quoted'`).
- **Payment Success**: Webhook from Stripe.

## Flow
1. **Receive Request** -> Notify Artist (Email/In-app).
2. **Artist Quotes** -> Notify Client + Generate Payment Link.
3. **Client Pays** -> Validate Webhook -> Update `bookings.status = 'paid'` -> Notify Artist.
4. **Artist Confirms** -> Update `bookings.status = 'confirmed'` -> Appointment Booked.

## Error Handling
- If payment fails, notify Client to retry.
- If Artist doesn't quote in 48h, notify Client/System.

## Dependencies (services, credentials, endpoints)
- Supabase (DB & Webhooks).
- Stripe (Payments).
- Resend (Email).

## Testing (how to manually trigger and verify)
1. Insert a mock row in `bookings` via Supabase Dashboard.
2. Simulate a Stripe webhook using Stripe CLI or Postman.
