---
name: Requirements
description: Generate a unified requirements document defining what to build.
---

# Requirements

Use after product discovery to define **what we're building** in a single document readable by the client.

## Output → `docs/requirements.md`

```markdown
# Requirements: InkMatch

## Overview
InkMatch es una plataforma web (Marketplace) que conecta a personas que buscan tatuarse con artistas profesionales. Soluciona la fricción de la reserva (mensajes interminables, señas manuales) y reduce la incertidumbre del resultado final mediante una herramienta de Inteligencia Artificial (AI Try-On) que permite visualizar el diseño en la piel antes de tatuar.

## Goals
1.  **Reducir el tiempo de gestión:** Que el artista pase menos tiempo chateando y más tatuando (automatizar la toma de datos y seña).
2.  **Aumentar la conversión:** Que el cliente se sienta seguro al ver la simulación con IA y reserve más rápido.
3.  **Centralizar la agenda:** Eliminar el uso de cuadernos o WhatsApp para gestionar turnos.

## User Stories

### Autenticación y Perfiles
1.  **Registro y Login:** Como Usuario (Cliente o Artista), quiero registrarme con Google o Email para acceder a mi cuenta.
    * *Criterio de Aceptación:* Login social funcional. Distinción clara de roles (Cliente vs Artista) al registrarse.
2.  **Perfil de Artista:** Como Artista, quiero cargar mis fotos de trabajos, biografía, ubicación y estilos (Realismo, Tradicional, etc.) para atraer clientes.
    * *Criterio de Aceptación:* Galería de imágenes grid, mapa de ubicación, listado de estilos.

### Gestión de Agenda (El "Core")
3.  **Configurar Disponibilidad:** Como Artista, quiero definir mis días y horarios laborales (ej. Lun-Vie 10-18hs) para que no me pidan turnos cuando no trabajo.
    * *Criterio de Aceptación:* Selector de rangos horarios semanales.
4.  **Solicitar Turno:** Como Cliente, quiero seleccionar un horario disponible, subir referencia del diseño y foto de la zona del cuerpo para iniciar una solicitud.
    * *Criterio de Aceptación:* Formulario con datepicker, upload de 2 imágenes (diseño + cuerpo) y campo de texto "Idea".

### Flujo de Presupuesto y Reserva
5.  **Cotizar Solicitud:** Como Artista, quiero ver una solicitud pendiente, definir el **Precio Total** y la **Duración Estimada** (1h, 3h, sesión completa) para enviarle el presupuesto al cliente.
    * *Criterio de Aceptación:* La solicitud pasa de estado "Pendiente" a "Presupuestado". El cliente recibe notificación (email/app).
6.  **Pagar Seña:** Como Cliente, quiero ver el presupuesto y pagar una seña (porcentaje configurable o monto fijo) para confirmar el turno.
    * *Criterio de Aceptación:* Integración con pasarela de pago (MP/Stripe). Al confirmarse el pago, el turno se bloquea en la agenda del artista. Estado: "Confirmado".

### AI Tattoo Try-On (La "Magia")
7.  **Simular Tatuaje:** Como Cliente, quiero subir una foto de mi cuerpo y una imagen del diseño, y recibir una imagen generada donde el tatuaje parece estar en mi piel.
    * *Criterio de Aceptación:* La imagen resultante debe respetar la perspectiva/curvatura básica de la zona. Tiempo de respuesta < 30 seg. Opción de descargar o adjuntar a la reserva.

## Scope (v1)

### In Scope (MVP)
- Web App Responsive (Móvil y Escritorio).
- Roles: Visitante, Cliente, Artista, Admin (Soporte).
- Buscador de artistas por estilo/zona.
- Flujo completo de reserva (Solicitud -> Presupuesto -> Seña -> Confirmación).
- AI Try-On (Funcionalidad "beta" opcional).
- Dashboard básico de turnos para el artista.

### Out of Scope
- App nativa (iOS/Android) descargable de stores.
- Chat en tiempo real (se manejará por notificaciones/estados o link a WA).
- Red social interna (likes, comentarios, seguidores).
- Pagos recurrentes o suscripciones para artistas.

## Constraints & Assumptions
- **Pagos:** Se usará MercadoPago (Argentina) como prioridad. El resto se paga en efectivo/transferencia en el local.
- **Costos AI:** Cada generación de imagen tiene un costo de API (Replicate/OpenAI). Se limitará a X intentos gratuitos por usuario registrado para evitar abuso.
- **Legal:** El artista es responsable de la higiene y seguridad; la plataforma es solo intermediaria.