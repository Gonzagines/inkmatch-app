---
name: System Architecture
description: Design how to implement the requirements — stack, data model, APIs, integrations, and technical decisions.
---

# System Architecture

Use after requirements to design **how to build it**.

## Process

1. Read `docs/requirements.md`.
2. Identify components: frontend, backend, database, external services, automations.
3. Define data model, API surface, and integrations.
4. Document quality constraints and the decisions they drive.

## Output → `docs/architecture.md`

```markdown
# Architecture: InkMatch

## System Overview
InkMatch es un marketplace web progresivo que centraliza la gestión de turnos para tatuadores y reduce la incertidumbre de los clientes mediante visualización con IA. El sistema utiliza una arquitectura "Serverless" moderna, delegando la persistencia y autenticación a Supabase, la orquestación de IA compleja a n8n, y el renderizado rápido a Next.js (App Router).

## Component Diagram
```mermaid
graph TD
    User[Web Client] -->|HTTPS| Next[Next.js App Router]
    User -->|Auth & Data| SB_Auth[Supabase Auth]
    User -->|Direct Upload| SB_Storage[Supabase Storage]
    
    Next -->|API Routes| SB_DB[(Supabase DB)]
    Next -->|Webhook| n8n[n8n Automation]
    
    n8n -->|Generate Img| Replicate[Replicate API]
    n8n -->|Update| SB_DB
    n8n -->|Save Img| SB_Storage
    
    SB_DB -->|Realtime| User
    
    subgraph External
    Replicate
    MercadoPago
    end


## Tech Stack
| Layer        | Technology                         | Why                                                                                                           |
| Frontend     | Next.js 14 (App Router) + Tailwind | SEO vital para perfiles de artistas. Server Components reducen JS en cliente.                                 |
| Backend / DB | Supabase (Postgres + Auth)         | Backend-as-a-Service reduce tiempo de desarrollo. RLS maneja seguridad sin escribir APIs complejas.           |
| Automation   | n8n	                            | Desacopla la lógica lenta de IA (timeouts) y orquesta notificaciones/emails sin ensuciar el código de Next.js.|
| AI Models    | Replicate (Flux/SD)                | API on-demand para generación de imágenes sin mantener servidores GPU propios.                                |
| Payments     | MercadoPago                        | Estándar en la región (Argentina). Documentación clara y flujo de split-payments a futuro.                    |


## Data Model
erDiagram
    PROFILES ||--|| ARTIST_DETAILS : has
    PROFILES ||--o{ APPOINTMENTS : requests
    ARTIST_DETAILS ||--o{ PORTFOLIO_ITEMS : showcases
    ARTIST_DETAILS ||--o{ APPOINTMENTS : manages

    PROFILES {
        uuid id PK
        enum role "client, artist, admin"
        string full_name
        string avatar_url
    }

    ARTIST_DETAILS {
        uuid id PK "FK -> profiles.id"
        string bio
        jsonb working_hours "{mon: [10, 18], ...}"
        string location_city
        string mp_public_key
    }

    APPOINTMENTS {
        uuid id PK
        uuid client_id FK
        uuid artist_id FK
        enum status "REQUESTED, QUOTED, DEPOSIT_PENDING, CONFIRMED, COMPLETED, CANCELLED"
        timestamp proposed_date
        timestamp confirmed_date
        int duration_minutes
        decimal price_total
        decimal deposit_amount
        string design_image_url
        string body_image_url
        string ai_result_image_url
    }

    PORTFOLIO_ITEMS {
        uuid id PK
        uuid artist_id FK
        string image_url
        string[] tags
    }

## API Design

GET /artists/{username}: Perfil público (ISR - Incremental Static Regeneration).

POST /api/appointments: Crea solicitud (valida input y sube archivos).

PATCH /api/appointments/{id}/quote: (Artista) Define precio y cambia estado a QUOTED.

POST /api/ai/try-on: Dispara el workflow de n8n para simulación.

POST /api/payments/preference: Genera link de pago de MercadoPago.

## Integrations
| Service     | Purpose                            | Protocol                     |
| Supabase    |	Auth, DB, Realtime, Storage        |	Client Library (HTTPS/WSS)|
| Replicate   |	Generación de imágenes IA (Try-On) |	REST API (vía n8n)        |
| MercadoPago |	Cobro de señas                     |	REST API / SDK            |
| n8n         |	Orquestador de procesos asíncronos |	Webhooks                  |

## Quality Attributes

- Performance: Carga de perfil de artista < 1.5s (usando Next.js Image Optimization y Edge Caching).

- Security: Ningún usuario puede ver datos de turnos ajenos (RLS Policies estricto en Postgres).

- Usability (Mobile First): El flujo de reserva debe ser navegable con una sola mano en móviles.

- Reliability: Si la IA falla, el flujo de reserva NO se detiene (Graceful degradation

## Key Decisions
- Context: La generación de imágenes con IA puede tardar 10-30 segundos.

- Choice: Usar n8n + Webhooks en lugar de esperar la respuesta en la misma llamada API.

- Tradeoff: Añade complejidad de infraestructura (n8n), pero evita que la página web se "cuelgue" esperando y mejora la UX.

- Context: Gestión de horarios.

- Choice: Solicitud de Turno (Async) en lugar de Booking en Tiempo Real.

- Tradeoff: El cliente no tiene confirmación inmediata, pero el artista mantiene el control total de su agenda y tiempos (vital en tatuajes).
## Rules

- Must be implementable with the stack in `01-project-context.md`.
- Prefer boring technology. Complex tools need to justify themselves.
- v1 scope only — don't design for hypothetical futures.
- Quality Attributes should connect to Key Decisions: every constraint should trace to a choice that addresses it.
- **No over-architecture**: Do not introduce microservices, message queues, or complex infra unless requirements explicitly justify the complexity.
