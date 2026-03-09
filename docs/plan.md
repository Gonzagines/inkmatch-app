# Plan: InkMatch (Strategy: AI First)

## Milestones

### M1: The "AI Spike" (Proof of Concept) — ~3 días
**Goal:** Validar que podemos superponer un tatuaje en la piel de forma realista usando n8n + Replicate.
- [ ] Scaffold: Next.js básico (sin Auth compleja, solo una página de prueba).
- [ ] Automation: Workflow n8n que recibe 2 imágenes y devuelve la fusión.
- [ ] UI: Formulario simple (Upload Cuerpo + Upload Diseño -> Ver Resultado).
- [ ] Tech Check: Evaluar calidad del "warping" y tiempos de respuesta.

### M2: Foundation & Profiles — ~1.5 semanas
**Goal:** Estructura real. Auth, Perfiles de Artista y Storage seguro.
- [ ] Configurar Supabase Auth (Roles).
- [ ] Migrar el "AI Spike" a una ruta protegida.
- [ ] Perfiles públicos de artistas.

### M3: Booking Core — ~2 semanas
**Goal:** Solicitudes y Presupuestos.
- [ ] State Machine de turnos.
- [ ] Dashboard de Artista.

### M4: Payments — ~1 semana
**Goal:** Cobro de señas (MercadoPago).