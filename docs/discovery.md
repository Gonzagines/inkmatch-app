# Discovery: InkMatch

## Problem
Searching for the right tattoo artist and visualizing how a design will look on one's body is a fragmented and uncertain process. Clients often struggle to:
- Find artists that match their style.
- Get accurate quotes without long back-and-forth.
- Imagine the final result on their specific body part.
- Manage the booking and deposit process securely.

## Users
1. **The Client**: Wants to explore designs, "try them on" using AI, and book an artist with a clear budget.
2. **The Artist**: Wants to showcase their portfolio, manage booking requests, provide quotes, and secure deposits.

## Core Needs
- **Visualization**: A way to see a tattoo design on a photo of the user's body.
- **Seamless Booking**: A structured flow from request to confirmed appointment.
- **Financial Security**: Handling quotes, deposits, and payments reliably.

## MVP Scope (MoSCoW)
### Must Have
- User Authentication (Supabase Auth).
- Artist Profiles & Portfolio.
- **AI Tattoo Try-On**: Upload body photo + tattoo design -> AI generated overlay.
- **Booking Flow**: Request -> Quote (Artist) -> Deposit (Client via n8n/Payment Link) -> Confirm (Artist).
- Database to store artists, clients, designs, and bookings.

### Should Have
- Search and Filter for artists by style/location.
- Real-time Notifications for booking status changes.
- Storage for body photos and generated try-ons.

### Could Have
- AI Tattoo Design Generation (Text-to-Image).
- Reviews and Ratings system.
- Calendar integration for artists.

### Won't Have (v1)
- In-app chat (use email/notifications for now).
- Advanced CRM for artists.

## Risks & Open Questions
- **AI Quality**: How realistic will the "Try-On" be? (Risk: Technical feasibility of high-quality overlay).
- **Payment Integration**: Which provider to use for deposits? (Open Question: Stripe/MercadoPago?).
- **n8n Workflow**: Complexity of the multi-step booking state machine.
