---
name: Product Discovery
description: Run a structured product discovery session and produce a discovery.md document.
---

# Product Discovery

Use at project start to understand **what to build, for whom, and what's the MVP**.

## Process

1. **Understand the problem** — ask the client:
   - What problem are we solving? Who has this problem?
   - What does a win look like for you? How do you measure it?
   - Is there a current solution or workaround?
   - Hard constraints? (budget, timeline, integrations, regulations)

2. **Define who uses it** (max 3 personas): role, goal, main frustration.

3. **What do users need to accomplish?** For each persona: what's the core task they need to get done? What's the ideal outcome?

4. **Define MVP scope** — list candidate features, prioritize with MoSCoW (Must / Should / Could / Won't). Be ruthless with Must-haves.

5. **Flag risks**: technical unknowns, third-party dependencies, anything that could block delivery.

## Output → `docs/discovery.md`

```markdown
# Discovery: InkMatch (Marketplace Tatuadores)

## Problem
Los clientes sienten incertidumbre sobre cómo quedará un tatuaje y les cuesta coordinar turnos y precios con los artistas (mensajes infinitos). Los tatuadores pierden tiempo filtrando consultas vagas y gestionando señas manualmente.

## Users
1.  **El Cliente ("El Pibe Tinta"):** Quiere ver trabajos, probarse el diseño (AI) para quitarse el miedo, saber cuánto cuesta y reservar sin dar vueltas.
2.  **El Artista ("El Master"):** Quiere recibir solicitudes serias (con foto y zona), cobrar la seña automáticamente para asegurar el turno y organizar su agenda visualmente.

## Core Needs
- **Visualización:** Ver el portafolio y simular el tatuaje en el cuerpo (Try-On).
- **Booking:** Flujo claro de Solicitud -> Presupuesto -> Seña -> Turno Confirmado.
- **Seguridad:** Gestión de señas (MercadoPago) para evitar el "no-show".

## MVP Scope (MoSCoW)

### Must Have (Lo vital)
- **Perfiles de Artista:** Galería de fotos, info, especialidad y ubicación.
- **Solicitud de Turno:** Formulario con upload de Diseño + Foto Zona + Preferencia Horaria.
- **Gestión de Agenda (Simple):** Artista define rangos horarios (ej. Lun-Vie 10-18hs). Cliente ve huecos y solicita.
- **Chat/Negociación:** Artista recibe solicitud, envía precio ($) y duración estimada.
- **Pagos:** Integración para cobrar **Seña** (Deposit) y cambiar estado a "Confirmado".
- **Dashboard Artista:** Ver solicitudes pendientes y calendario.

### Should Have (Importante)
- **AI Tattoo Try-On:** Herramienta opcional en el flujo. Sube foto cuerpo + diseño -> devuelve imagen compuesta.
- **Notificaciones:** Email/WhatsApp cuando cambia el estado (Presupuesto listo, Seña recibida).

### Could Have (Futuro)
- Sincronización con Google Calendar.
- Feed social tipo Instagram.

### Won't Have (v1)
- Pago total por la app (solo seña).
- App móvil nativa (será Web App Responsive).

## Risks & Open Questions
- **Duración de Sesiones:** El usuario no sabe cuánto tiempo reservar. *Mitigación: El usuario elige hora de inicio, el artista confirma duración.*
- **Calidad de IA:** El "warping" (curvar la imagen en la piel) puede fallar en zonas complejas (cuello, codo). *Mitigación: Usar modelo potente (Replicate) y aclarar que es "referencial".*```

One page. If it's longer, you're overthinking it.
