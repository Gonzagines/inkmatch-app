# Requirements: InkMatch

## Overview
InkMatch is a marketplace that connects tattoo enthusiasts with professional artists, featuring an AI-powered visualization tool and a structured booking management system.

## Goals
1. Enable users to visualize tattoos on their body using AI with < 10s wait time.
2. Reduce booking friction by automating the Quote -> Deposit -> Confirm flow.
3. Provide a secure platform for artists to manage their schedule and payments.

## User Stories

### AI Tattoo Try-On
- **As a Client**, I want to upload a photo of my body part and a tattoo design, so that I can see how it would look before committing.
    - *Acceptance Criteria*:
        - Support for .jpg and .png formats.
        - AI generates a realistic overlay respecting skin contours.
        - Result is displayed within the UI and can be saved to profile.

### Booking & Quotes
- **As a Client**, I want to send a booking request to an artist with details of my tattoo idea, so that I can get a price estimate.
    - *Acceptance Criteria*:
        - Request includes description, size estimate, and placement.
        - Artist receives a notification of the new request.
- **As an Artist**, I want to review requests and send a quote (price + estimated time), so that the client can decide to proceed.
    - *Acceptance Criteria*:
        - Artist can set a price and a message.
        - Sending a quote triggers a notification to the client.
- **As a Client**, I want to pay a deposit for a quote, so that my appointment is secured.
    - *Acceptance Criteria*:
        - Payment is handled through a secure link (simulated or real).
        - Successful payment updates booking status to "Deposit Paid".

## Scope
### In Scope (v1)
- Auth (Email/Google).
- Artist portfolios.
- AI Try-on (Replicate API).
- Booking state machine (n8n).
- Deposit handling.

### Out of Scope
- Mobile App (Web-first).
- Social networking features (Follows, Likes).

## Constraints & Assumptions
- **Timeline**: MVP development focus.
- **Dependencies**: Supabase for infra, Replicate/OpenAI for AI, n8n for workflows.
- **Assumption**: Users have decent quality photos for the AI try-on to work well.
